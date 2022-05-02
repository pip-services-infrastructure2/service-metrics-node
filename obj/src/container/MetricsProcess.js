"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsProcess = void 0;
const pip_services3_container_nodex_1 = require("pip-services3-container-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
const pip_services3_swagger_nodex_1 = require("pip-services3-swagger-nodex");
const pip_services3_prometheus_nodex_1 = require("pip-services3-prometheus-nodex");
const pip_services3_elasticsearch_nodex_1 = require("pip-services3-elasticsearch-nodex");
const MetricsServiceFactory_1 = require("../build/MetricsServiceFactory");
class MetricsProcess extends pip_services3_container_nodex_1.ProcessContainer {
    constructor() {
        super("service-metrics", "Analytical metrics microservice");
        this._factories.add(new pip_services3_rpc_nodex_1.DefaultRpcFactory());
        this._factories.add(new pip_services3_swagger_nodex_1.DefaultSwaggerFactory());
        this._factories.add(new MetricsServiceFactory_1.MetricsServiceFactory());
        this._factories.add(new pip_services3_elasticsearch_nodex_1.DefaultElasticSearchFactory());
        this._factories.add(new pip_services3_prometheus_nodex_1.DefaultPrometheusFactory());
    }
}
exports.MetricsProcess = MetricsProcess;
//# sourceMappingURL=MetricsProcess.js.map