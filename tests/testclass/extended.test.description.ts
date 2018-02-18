import {TestDescription} from "./test.description";

export class ExtendedTestDescription extends TestDescription {

    private _moreDescription: string;

    constructor(text: string, id: number, moreDescription: string) {
        super(text, id);
        this._moreDescription = moreDescription;
    }

    get moreDescription(): string {
        return this._moreDescription;
    }

    set moreDescription(value: string) {
        this._moreDescription = value;
    }
}
