"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsServiceFactory = void 0;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const MetricsMemoryPersistence_1 = require("../persistence/MetricsMemoryPersistence");
const MetricsFilePersistence_1 = require("../persistence/MetricsFilePersistence");
const MetricsMongoDbPersistence_1 = require("../persistence/MetricsMongoDbPersistence");
const MetricsController_1 = require("../logic/MetricsController");
const MetricsCommandableHttpServiceV1_1 = require("../services/version1/MetricsCommandableHttpServiceV1");
class MetricsServiceFactory extends pip_services3_components_nodex_1.Factory {
    constructor() {
        super();
        this.Descriptor = new pip_services3_commons_nodex_1.Descriptor("service-metrics", "factory", "service", "default", "1.0");
        this.MemoryPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-metrics", "persistence", "memory", "*", "1.0");
        this.FilePersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-metrics", "persistence", "file", "*", "1.0");
        this.MongoDbPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-metrics", "persistence", "mongodb", "*", "1.0");
        this.ControllerDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-metrics", "controller", "default", "*", "1.0");
        this.CmdHttpServiceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-metrics", "service", "commandable-http", "*", "1.0");
        this.registerAsType(this.MemoryPersistenceDescriptor, MetricsMemoryPersistence_1.MetricsMemoryPersistence);
        this.registerAsType(this.FilePersistenceDescriptor, MetricsFilePersistence_1.MetricsFilePersistence);
        this.registerAsType(this.MongoDbPersistenceDescriptor, MetricsMongoDbPersistence_1.MetricsMongoDbPersistence);
        this.registerAsType(this.ControllerDescriptor, MetricsController_1.MetricsController);
        this.registerAsType(this.CmdHttpServiceDescriptor, MetricsCommandableHttpServiceV1_1.MetricsCommandableHttpServiceV1);
    }
}
exports.MetricsServiceFactory = MetricsServiceFactory;
//# sourceMappingURL=MetricsServiceFactory.js.map