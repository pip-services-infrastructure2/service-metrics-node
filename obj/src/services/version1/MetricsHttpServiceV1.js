"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsHttpServiceV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
class MetricsHttpServiceV1 extends pip_services3_rpc_nodex_1.CommandableHttpService {
    constructor() {
        super("v1/metrics");
        this._dependencyResolver.put("controller", new pip_services3_commons_nodex_1.Descriptor("service-metrics", "controller", "default", "*", "1.0"));
    }
}
exports.MetricsHttpServiceV1 = MetricsHttpServiceV1;
//# sourceMappingURL=MetricsHttpServiceV1.js.map