import {Type} from '@digitalascetic/ngx-reflection';
import {TestDescription} from './test.description';


export class TestDescriptionHolder {

    private _name: string;

    private _type: string;

    @Type(() => TestDescription)
    private _descs: Array<TestDescription>;

    constructor(name: string, descs: Array<TestDescription>) {
        this._name = name;
        this._descs = descs || [];
    }


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get type(): string {
        return this._type;
    }

    get descs(): Array<TestDescription> {
        return this._descs;
    }
}
