import {TestClass} from "./test.class";
import {TestDescription} from "./test.description";

export class ChildTestClass extends TestClass {

    private _childType: number;

    constructor(name: string, description: TestDescription, startDate: Date, childType: number) {
        super(name, description, startDate);
        this._childType = childType;
    }

    get childType(): number {
        return this._childType;
    }
}
