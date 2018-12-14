import {Type} from "@digitalascetic/ngx-reflection";
import {TestClass} from "./test.class";

export class ComposedTestClass {

    @Type()
    private _id: number;

    @Type(() => TestClass)
    private _testClass: TestClass;

    constructor(id: number, testClass: TestClass) {
        this._id = id;
        this._testClass = testClass;
    }

    get testClass(): TestClass {
        return this._testClass;
    }

    set testClass(value: TestClass) {
        this._testClass = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }
}
