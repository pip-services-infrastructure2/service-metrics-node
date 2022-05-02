import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
export declare class MetricsServiceFactory extends Factory {
    Descriptor: Descriptor;
    MemoryPersistenceDescriptor: Descriptor;
    FilePersistenceDescriptor: Descriptor;
    MongoDbPersistenceDescriptor: Descriptor;
    ControllerDescriptor: Descriptor;
    HttpServiceDescriptor: Descriptor;
    constructor();
}
