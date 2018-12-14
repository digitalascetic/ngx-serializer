import {Type} from "@digitalascetic/ngx-reflection";


export class ComposedUndefinedProp {

    @Type()
    private _name: string;

    @Type()
    private _test: boolean;

    @Type(() => ComposedUndefinedProp)
    private _parent: ComposedUndefinedProp;


    constructor(name: string) {
        this._name = name;
    }


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get test(): boolean {
        return this._test;
    }

    set test(value: boolean) {
        this._test = value;
    }

    get parent(): ComposedUndefinedProp {
        return this._parent;
    }

    set parent(value: ComposedUndefinedProp) {
        this._parent = value;
    }
}
