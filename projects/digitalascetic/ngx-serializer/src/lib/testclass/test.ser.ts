import {Type} from "@digitalascetic/ngx-reflection";
import {PrimaryKeyObject} from "@digitalascetic/ngx-object-transformer";

export class TestSer implements PrimaryKeyObject {

    getPrimaryKeyPropertyName(): string {
        return "id";
    }

    @Type()
    public id: number;

    @Type(() => TestSer)
    public relatedTestSer: TestSer|null;

    constructor(id: number, relatedTestSer: TestSer|null) {
        this.id = id;
        this.relatedTestSer = relatedTestSer;
    }

}
