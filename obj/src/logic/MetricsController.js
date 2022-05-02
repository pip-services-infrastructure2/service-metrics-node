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
exports.MetricsController = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const MetricValueV1_1 = require("../data/version1/MetricValueV1");
const TimeHorizonConverter_1 = require("../persistence/TimeHorizonConverter");
const TimeIndexComposer_1 = require("../persistence/TimeIndexComposer");
const TimeParser_1 = require("../persistence/TimeParser");
const MetricsCommandSet_1 = require("./MetricsCommandSet");
class MetricsController {
    constructor() {
        this._defaultConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples("dependencies.persistence", "service-metrics:persistence:*:*:1.0");
        this._dependencyResolver = new pip_services3_commons_nodex_2.DependencyResolver(this._defaultConfig);
    }
    configure(config) {
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired("persistence");
    }
    getCommandSet() {
        if (this._commandSet == null) {
            this._commandSet = new MetricsCommandSet_1.MetricsCommandSet(this);
        }
        return this._commandSet;
    }
    getMetricDefinitionsWithName(correlationId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_3.FilterParams.fromTuples("name", name, "time_horizon", 0);
            let take = 500;
            let paging = new pip_services3_commons_nodex_4.PagingParams(0, take);
            let definitions = {};
            let reading = true;
            while (reading) {
                let page = yield this._persistence.getPageByFilter(correlationId, filter, paging);
                for (let record of page.data) {
                    let definition = definitions[record.name];
                    if (definition == null) {
                        definition = {
                            name: record.name,
                            dimension1: [],
                            dimension2: [],
                            dimension3: []
                        };
                        definitions[record.name] = definition;
                    }
                    if (record.d1 != null && definition.dimension1.indexOf(record.d1) < 0) {
                        definition.dimension1.push(record.d1);
                    }
                    if (record.d2 != null && definition.dimension2.indexOf(record.d2) < 0) {
                        definition.dimension2.push(record.d2);
                    }
                    if (record.d3 != null && definition.dimension3.indexOf(record.d3) < 0) {
                        definition.dimension3.push(record.d3);
                    }
                }
                if (page.data.length > 0)
                    paging.skip += take;
                else
                    reading = false;
            }
            let values = Object.values(definitions);
            return values;
        });
    }
    getMetricDefinitions(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getMetricDefinitionsWithName(correlationId, null);
        });
    }
    getMetricDefinitionByName(correlationId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = yield this.getMetricDefinitionsWithName(correlationId, name);
            return items.length > 0 ? items[0] : null;
        });
    }
    getMetricsByFilter(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            let page = yield this._persistence.getPageByFilter(correlationId, filter, paging);
            let timeHorizon = TimeHorizonConverter_1.TimeHorizonConverter.fromString(filter.getAsNullableString("time_horizon"));
            let fromIndex = TimeIndexComposer_1.TimeIndexComposer.composeFromIndexFromFilter(timeHorizon, filter);
            let toIndex = TimeIndexComposer_1.TimeIndexComposer.composeToIndexFromFilter(timeHorizon, filter);
            // Convert records into value sets
            let sets = {};
            for (let record of page.data) {
                // Generate index
                let id = record.name + "_" + (record.d1 || "")
                    + "_" + (record.d2 || "")
                    + "_" + (record.d3 || "");
                // Get or create value set
                let set = sets[id];
                if (set == null) {
                    set = {
                        name: record.name,
                        time_horizon: record.th,
                        dimension1: record.d1,
                        dimension2: record.d2,
                        dimension3: record.d3,
                        values: []
                    };
                    sets[id] = set;
                }
                for (let key in record.val) {
                    if (key < fromIndex || key > toIndex)
                        continue;
                    let value = new MetricValueV1_1.MetricValueV1();
                    TimeParser_1.TimeParser.parseTime(key, timeHorizon, value);
                    value.count = record.val[key].cnt;
                    value.sum = record.val[key].sum;
                    value.min = record.val[key].min;
                    value.max = record.val[key].max;
                    set.values.push(value);
                }
                ;
            }
            let total = page.total;
            let values = Object.values(sets);
            return new pip_services3_commons_nodex_5.DataPage(values, total);
        });
    }
    updateMetric(correlationId, update, maxTimeHorizon) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._persistence.updateOne(correlationId, update, maxTimeHorizon);
        });
    }
    updateMetrics(correlationId, updates, maxTimeHorizon) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._persistence.updateMany(correlationId, updates, maxTimeHorizon);
        });
    }
}
exports.MetricsController = MetricsController;
//# sourceMappingURL=MetricsController.js.map