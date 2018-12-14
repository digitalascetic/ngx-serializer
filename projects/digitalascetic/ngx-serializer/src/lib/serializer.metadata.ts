import {SerializerDirection} from './serializer-direction';
import {ObjectTransformer} from '@digitalascetic/ngx-object-transformer';


export function SerializerTransformer(transformer: ObjectTransformer) {
    return Reflect.metadata('SerializerTransformer', transformer);
}

export function SerializerExclude(obj?: { func?: Function, direction?: SerializerDirection }) {

    let options: any = {
        func: () => {
            return true
        }, direction: SerializerDirection.ANY
    };
    Object.assign(options, obj);
    return Reflect.metadata('SerializerExclude', options);
}

export function SerializerReplace(prop: string, excludeIfNull: boolean = true) {
    return Reflect.metadata('SerializerReplace', {prop: prop, excludeIfNull: excludeIfNull});
}



