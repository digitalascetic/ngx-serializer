import {NgModule} from '@angular/core';
import {ReflectionModule} from '@digitalascetic/ngx-reflection';
import {SerializerService} from "./serializer.service";

@NgModule({
    imports: [
        ReflectionModule
    ]
})
export class SerializerModule {

}
