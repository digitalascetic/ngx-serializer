import {TestDescription} from "./test.description";
import {DateTransformer} from "@digitalascetic/ngx-object-transformer";
import {SerializerTransformer} from "../../src";
import {Type} from "@digitalascetic/ngx-reflection";

export class TestClass {

    private _name:string;

    @Type(()=>TestDescription)
    private _description:TestDescription;

    @SerializerTransformer(new DateTransformer("YYYY-MM-DD"))
    @Type(()=>Date)
    private _startDate:Date;

    constructor(name:string, description:TestDescription, startDate:Date) {
        this._name = name;
        this._description = description;
        this._startDate = startDate;
    }


    get name():string

    {
        return this._name;
    }

    get description():TestDescription

    {
        return this._description;
    }

    get startDate():Date

    {
        return this._startDate;
    }
}
