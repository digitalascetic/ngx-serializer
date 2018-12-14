export interface PostDeSerializeListener {

    onPostDeserialize(obj: any, clazz?: Function): any;

}