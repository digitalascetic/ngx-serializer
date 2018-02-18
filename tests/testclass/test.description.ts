import {Type} from "@digitalascetic/ngx-reflection";

export class TestDescription {

    @Type(() => Number)
    private _id: number | undefined;

    private _text: string;

    constructor(text: string, id?: number) {
        this._text = text;
        this._id = id;
    }


    get id(): number | undefined {
        return this._id;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
    }
}
