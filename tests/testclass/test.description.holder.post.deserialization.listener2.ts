import {PostDeSerializeListener} from "../../src/post.deserialize.listener";
import {TestDescriptionHolder} from "./test.description.hoilder";


export class TestDescriptionHolderPostDeserializationListener2 implements PostDeSerializeListener {

    onPostDeserialize(obj: any, clazz?: Function): any {
        if (clazz === TestDescriptionHolder) {
            return "new object";
        }
    }

}
