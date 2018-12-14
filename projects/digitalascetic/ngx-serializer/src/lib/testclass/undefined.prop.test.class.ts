import {Type} from "@digitalascetic/ngx-reflection";
import {ComposedUndefinedProp} from "./composed.unidefined.prop";


export class UndefinedPropTestClass {

    @Type()
    private _name: string;

    @Type()
    private _id: number;

    @Type(() => ComposedUndefinedProp)
    private _compProp: ComposedUndefinedProp;

    constructor(name: string) {
        this._name = name;
    }


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }


    get compProp(): ComposedUndefinedProp {
        return this._compProp;
    }

    set compProp(value: ComposedUndefinedProp) {
        this._compProp = value;
    }
}
