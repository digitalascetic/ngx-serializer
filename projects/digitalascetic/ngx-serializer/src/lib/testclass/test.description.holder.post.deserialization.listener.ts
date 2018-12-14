import {PostDeSerializeListener} from '../post.deserialize.listener';
import {TestDescriptionHolder} from './test.description.hoilder';


export class TestDescriptionHolderPostDeserializationListener implements PostDeSerializeListener {

    onPostDeserialize(obj: any, clazz?: Function): any {
        if (clazz === TestDescriptionHolder) {
            let tdh: TestDescriptionHolder = obj;
            tdh.name = 'name changed';
        }
    }

}
