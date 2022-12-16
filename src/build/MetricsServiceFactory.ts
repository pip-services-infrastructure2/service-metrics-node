import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { MetricsMemoryPersistence } from '../persistence/MetricsMemoryPersistence';
import { MetricsFilePersistence } from '../persistence/MetricsFilePersistence';
import { MetricsMongoDbPersistence } from '../persistence/MetricsMongoDbPersistence';
import { MetricsController } from '../logic/MetricsController';
import { MetricsCommandableHttpServiceV1 } from '../services/version1/MetricsCommandableHttpServiceV1';

export class MetricsServiceFactory extends Factory {
    public Descriptor: Descriptor = new Descriptor("service-metrics", "factory", "service", "default", "1.0");
    public MemoryPersistenceDescriptor: Descriptor = new Descriptor("service-metrics", "persistence", "memory", "*", "1.0");
    public FilePersistenceDescriptor: Descriptor = new Descriptor("service-metrics", "persistence", "file", "*", "1.0");
    public MongoDbPersistenceDescriptor: Descriptor = new Descriptor("service-metrics", "persistence", "mongodb", "*", "1.0");
    public ControllerDescriptor: Descriptor = new Descriptor("service-metrics", "controller", "default", "*", "1.0");
    public CmdHttpServiceDescriptor: Descriptor = new Descriptor("service-metrics", "service", "commandable-http", "*", "1.0");

    public constructor() {
        super();
        this.registerAsType(this.MemoryPersistenceDescriptor, MetricsMemoryPersistence);
        this.registerAsType(this.FilePersistenceDescriptor, MetricsFilePersistence);
        this.registerAsType(this.MongoDbPersistenceDescriptor, MetricsMongoDbPersistence);
        this.registerAsType(this.ControllerDescriptor, MetricsController);
        this.registerAsType(this.CmdHttpServiceDescriptor, MetricsCommandableHttpServiceV1);
    }
}

