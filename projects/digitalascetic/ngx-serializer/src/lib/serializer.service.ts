import {Injectable} from '@angular/core';
import {PropertyNameMapper} from '@digitalascetic/ngx-object-transformer';
import {PrimaryKeyObject} from '@digitalascetic/ngx-object-transformer';
import {SerializerDirection} from './serializer-direction';
import {ReflectionService} from '@digitalascetic/ngx-reflection';
import 'reflect-metadata';
import {PostDeSerializeListener} from './post.deserialize.listener';
import {SerializerConfig} from './serializer.config';

@Injectable()
export class SerializerService {

    private _serializedObjects: Array<any>;

    private _propNameMapper: PropertyNameMapper;

    private _reflectionService: ReflectionService;

    private _postDeserializeListeners: PostDeSerializeListener[];

    constructor(config: SerializerConfig = new SerializerConfig()) {
        this._propNameMapper = config.propNameMapper;
        this._postDeserializeListeners = config.postDeserializeListeners || [];
        this._reflectionService = new ReflectionService();
    }

    public serialize(obj: any): string {

        this._serializedObjects = [];
        return JSON.stringify(this.transformToObject(obj), (key, value) => {
            if (key == '__serializer') {
                return undefined;
            }
            return value;
        });

    }

    public transformToObject(obj: any): any {

        if (Array.isArray(obj)) {

            let resultArray: Array<any>;

            resultArray = obj.map(value => {
                return this.transformToObject(value);
            });

            return resultArray;
        }

        if (obj instanceof Object) {

            // Current object is being serialized so it must be added early
            // to serialized objects in case there's a reference to it in some of its
            // properties
            this._serializedObjects.push(obj);

            let result = {};

            if (obj.toJSON && obj.toJSON instanceof Function) {
                return obj.toJSON();
            }

            this._reflectionService.getObjectProperties(obj).forEach(
                prop => {

                    if (prop === '__serializer') {
                        return;
                    }

                    let newPropName = prop;
                    let recur = true;

                    if (this._propNameMapper) {
                        newPropName = this._propNameMapper.getTransformedName(prop, obj);
                    }

                    if (result[newPropName]) {
                        return;
                    }


                    let exclude = Reflect.getMetadata('SerializerExclude', obj, prop);

                    if (exclude && (exclude.direction == SerializerDirection.ANY ||
                            exclude.direction == SerializerDirection.SERIALIZE) &&
                        exclude.func(obj, prop)) {
                        result[newPropName] = undefined;
                        return;
                    }

                    let serializerTransformer = this.getMetadata(obj, prop, 'SerializerTransformer');

                    if (serializerTransformer) {
                        let typeProp = this._reflectionService.getObjectPropertyType(obj, prop);
                        result[newPropName] = serializerTransformer.transformToObject(obj[prop], typeProp);
                        return;
                    }

                    // Handle property decorators
                    if (obj[prop] instanceof Object) {

                        let replacePropObj = this.getMetadata(obj, prop, 'SerializerReplace');

                        if (replacePropObj) {

                            let replaceProp = replacePropObj['prop'];
                            let origPropName = this._propNameMapper.getOriginalName(replaceProp);

                            if (replacePropObj['excludeIfNull'] && this.isNullOrUndefined(obj[prop][origPropName])) {
                                return;
                            }

                            if (replaceProp && obj[prop] instanceof Object && !this.isNullOrUndefined(obj[prop][origPropName])) {

                                if (typeof obj[prop][origPropName] === 'undefined' ||
                                    obj[prop][origPropName] === null) {
                                    result[newPropName] = undefined;
                                } else {
                                    let replaceObj = {};
                                    replaceObj[replaceProp] = obj[prop][origPropName];
                                    result[newPropName] = replaceObj;
                                }

                                recur = false;

                            }

                        }

                        // Handle possible circular recursion
                        if (this.isAlreadySerialized(obj[prop])) {

                            if (obj[prop]['getPrimaryKeyPropertyName']) {
                                let primaryKeyObject: PrimaryKeyObject = <PrimaryKeyObject>obj[prop];
                                let primaryKey: string = primaryKeyObject.getPrimaryKeyPropertyName();
                                let replaceObj = {};
                                replaceObj[primaryKey] = obj[prop][primaryKey];
                                result[newPropName] = replaceObj;

                            } else {

                                result[newPropName] = undefined;

                            }

                            recur = false;

                        }

                        if (recur) {
                            result[newPropName] = this.transformToObject(obj[prop]);
                        }

                    } else {
                        result[newPropName] = obj[prop];
                    }

                });

            return result;
        }

        return obj;

    }

    public transformFromObject(plainObj, clazz?: Function): any {

        if (!clazz || !(plainObj instanceof Object)) {
            this._postDeserializeListeners.forEach((sub) => {
                let newObj = sub.onPostDeserialize(plainObj);
                if (newObj) {
                    plainObj = newObj;
                }
            });
            return plainObj;
        }

        if (plainObj instanceof Array) {
            let array: Array<any> = [];
            plainObj.forEach(
                item => {
                    array.push(this.transformFromObject(item, clazz));
                }
            );
            return array;
        }

        let obj = Reflect.construct(clazz, []);

        this._reflectionService.getObjectProperties(obj).forEach(
            prop => {

                let exclude = Reflect.getMetadata('SerializerExclude', obj, prop);

                if (exclude && (exclude.direction === SerializerDirection.ANY ||
                        exclude.direction === SerializerDirection.DESERIALIZE) &&
                    exclude.func(obj, prop)) {
                    return;
                }

                let planObjProp = this._propNameMapper ? this._propNameMapper.getTransformedName(prop) : prop;

                if (plainObj.hasOwnProperty(planObjProp)) {

                    let typeProp = this._reflectionService.getClassPropertyType(clazz, prop);

                    let serializerTransformer = this.getMetadata(obj, prop, 'SerializerTransformer');

                    if (serializerTransformer) {
                        obj[prop] = serializerTransformer.transformFromObject(plainObj[planObjProp], typeProp);
                        return;
                    }

                    if (typeProp && typeProp instanceof Function) {
                        obj[prop] = this.transformFromObject(plainObj[planObjProp], typeProp);
                    } else {
                        obj[prop] = this.transformFromObject(plainObj[planObjProp]);
                    }

                }

            }
        );

        this._postDeserializeListeners.forEach((sub) => {
            let newObj = sub.onPostDeserialize(obj, clazz);
            if (newObj) {
                obj = newObj;
            }
        });

        return obj;

    }

    public deserialize(json: string, clazz ?: Function, subProp?: string): any {

        let plainObj: any = JSON.parse(json);
        if (subProp) {
            plainObj = plainObj[subProp];
        }

        return this.transformFromObject(plainObj, clazz);

    }

    private getMetadata(obj, prop: string, metadataKey: string) {
        let metadata;
        if (obj.__serializer && obj.__serializer[prop]) {
            if (metadataKey == 'SerializerReplace') {
                metadata = {prop: obj.__serializer[prop][metadataKey]};
            } else {
                metadata = obj.__serializer[prop][metadataKey];
            }
        } else {
            metadata = Reflect.getMetadata(metadataKey, obj, prop)
        }
        return metadata;
    }

    private isAlreadySerialized(obj: Object): boolean {

        //noinspection TypeScriptUnresolvedFunction
        let result = this._serializedObjects.find(
            item => {
                return item === obj;
            }
        );

        return result ? true : false;

    }

    private isNotPrimitive(clazz) {
        return (clazz !== Number && clazz !== String);
    }

    private isNullOrUndefined(value) {
        return (value === null || typeof value === "undefined")
    }

}
