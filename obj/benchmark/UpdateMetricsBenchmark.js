"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMetricsBenchmark = void 0;
const pip_benchmark_node_1 = require("pip-benchmark-node");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const MetricsMongoDbPersistence_1 = require("../src/persistence/MetricsMongoDbPersistence");
const MetricsController_1 = require("../src/logic/MetricsController");
class UpdateMetricsBenchmark extends pip_benchmark_node_1.Benchmark {
    constructor() {
        super("UpdateMetricsBenchmark", "Measures performance of updating metrics in MongoDB database");
    }
    setUp() {
        return __awaiter(this, void 0, void 0, function* () {
            this._initialRecordNumber = this.context.parameters.InitialRecordNumber.getAsInteger();
            this._metricNumber = this.context.parameters.MetricNumber.getAsInteger();
            this._dimensionNumber = this.context.parameters.DimensionNumber.getAsInteger();
            this._updateNumber = this.context.parameters.UpdateNumber.getAsInteger();
            this._maxTimeHorizon = this.context.parameters.MaxTimeHorizon.getAsInteger();
            this._startTime = pip_services3_commons_nodex_1.DateTimeConverter.toDateTime(this.context.parameters.StartTime.getAsString());
            this._time = this._startTime;
            let mongoUri = this.context.parameters.MongoUri.getAsString();
            let mongoHost = this.context.parameters.MongoHost.getAsString();
            let mongoPort = this.context.parameters.MongoPort.getAsInteger();
            let mongoDb = this.context.parameters.MongoDb.getAsString();
            this._persistence = new MetricsMongoDbPersistence_1.MetricsMongoDbPersistence();
            this._persistence.configure(pip_services3_commons_nodex_2.ConfigParams.fromTuples('connection.uri', mongoUri, 'connection.host', mongoHost, 'connection.port', mongoPort, 'connection.database', mongoDb));
            this._controller = new MetricsController_1.MetricsController();
            this._controller.configure(pip_services3_commons_nodex_2.ConfigParams.fromTuples('options.interval', 5 // Set interval to 5 mins
            ));
            let references = pip_services3_commons_nodex_4.References.fromTuples(new pip_services3_commons_nodex_3.Descriptor('service-metrics', 'persistence', 'mongodb', 'default', '1.0'), this._persistence, new pip_services3_commons_nodex_3.Descriptor('service-metrics', 'controller', 'default', 'default', '1.0'), this._controller);
            this._controller.setReferences(references);
            yield this._persistence.open(null);
            this.context.sendMessage('Connected to mongodb database');
        });
    }
    tearDown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._persistence.close(null);
            this.context.sendMessage('Disconnected from mongodb database');
            this._persistence = null;
            this._controller = null;
        });
    }
    getRandomMetric() {
        return "metric" + Math.trunc(Math.random() * this._metricNumber + 1);
    }
    getRandomDimension() {
        return "dim" + Math.trunc(Math.random() * this._dimensionNumber + 1);
    }
    getRandomUpdate() {
        return {
            name: this.getRandomMetric(),
            year: this._time.getFullYear(),
            month: this._time.getMonth(),
            day: this._time.getDate(),
            hour: this._time.getHours(),
            minute: this._time.getMinutes(),
            dimension1: this.getRandomDimension(),
            dimension2: this.getRandomDimension(),
            dimension3: this.getRandomDimension(),
            value: Math.random() * 100
        };
    }
    getRandomUpdates() {
        let updates = [];
        for (let i = 0; i < this._updateNumber; i++)
            updates[i] = this.getRandomUpdate();
        return updates;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let updates = this.getRandomUpdates();
            yield this._controller.updateMetrics(null, updates, this._maxTimeHorizon);
        });
    }
}
exports.UpdateMetricsBenchmark = UpdateMetricsBenchmark;
//# sourceMappingURL=UpdateMetricsBenchmark.js.map