import {PostDeSerializeListener} from './post.deserialize.listener';
import {PropertyNameMapper} from '@digitalascetic/ngx-object-transformer';

/**
 *
 */
export class SerializerConfig {

    public propNameMapper: PropertyNameMapper;

    public postDeserializeListeners: PostDeSerializeListener[];

    constructor(propNameMapper: PropertyNameMapper = null, postDeserializeListeners: PostDeSerializeListener[] = []) {
        this.propNameMapper = propNameMapper;
        this.postDeserializeListeners = postDeserializeListeners;
    }

}
