import {Type} from '@digitalascetic/ngx-reflection';
import {SerializerExclude, SerializerReplace} from '../serializer.metadata';
import {TestDescription} from './test.description';

export class TestDecoratorClass {

    @SerializerReplace("id")
    @Type(() => TestDescription)
    private _description: TestDescription;

    @Type(() => TestDescription)
    @SerializerReplace("id", false)
    private _description2: TestDescription;

    @SerializerExclude()
    private _notInSer: string;

    private _inSer: number;

    constructor(description: TestDescription, notInSer: string, inSer: number) {
        this._description = description;
        this._notInSer = notInSer;
        this._inSer = inSer;
    }

    get description(): TestDescription {
        return this._description;
    }

    get notInSer(): string {
        return this._notInSer;
    }

    get inSer(): number {
        return this._inSer;
    }

    get description2(): TestDescription {
        return this._description2;
    }

    set description2(value: TestDescription) {
        this._description2 = value;
    }
}
