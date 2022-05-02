"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFilePersistence = void 0;
const pip_services3_data_nodex_1 = require("pip-services3-data-nodex");
const MetricsMemoryPersistence_1 = require("./MetricsMemoryPersistence");
class MetricsFilePersistence extends MetricsMemoryPersistence_1.MetricsMemoryPersistence {
    constructor(path) {
        super();
        this._persister = new pip_services3_data_nodex_1.JsonFilePersister(path);
        this._loader = this._persister;
        this._saver = this._persister;
    }
    configure(config) {
        super.configure(config);
        this._persister.configure(config);
    }
}
exports.MetricsFilePersistence = MetricsFilePersistence;
//# sourceMappingURL=MetricsFilePersistence.js.map