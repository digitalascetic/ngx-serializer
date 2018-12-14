import {PostDeSerializeListener} from '../post.deserialize.listener';
import {TestDescription} from './test.description';

export class TestDescriptionPostDeserializationListener implements PostDeSerializeListener {

    onPostDeserialize(obj: any, clazz?: Function): any {
        if (clazz === TestDescription) {
            let td: TestDescription = obj;
            td.text = 'new text';
        }
    }

}
