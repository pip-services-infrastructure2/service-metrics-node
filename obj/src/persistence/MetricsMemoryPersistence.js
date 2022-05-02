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
exports.MetricsMemoryPersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_data_nodex_1 = require("pip-services3-data-nodex");
const TimeHorizonV1_1 = require("../data/version1/TimeHorizonV1");
const TimeRangeComposer_1 = require("./TimeRangeComposer");
const TimeIndexComposer_1 = require("./TimeIndexComposer");
const TimeHorizonConverter_1 = require("./TimeHorizonConverter");
const MetricRecordIdComposer_1 = require("./MetricRecordIdComposer");
class MetricsMemoryPersistence extends pip_services3_data_nodex_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
        this.TimeHorizons = [
            TimeHorizonV1_1.TimeHorizonV1.Total,
            TimeHorizonV1_1.TimeHorizonV1.Year,
            TimeHorizonV1_1.TimeHorizonV1.Month,
            TimeHorizonV1_1.TimeHorizonV1.Day,
            TimeHorizonV1_1.TimeHorizonV1.Hour,
            TimeHorizonV1_1.TimeHorizonV1.Minute
        ];
        this._maxPageSize = 1000;
    }
    configure(config) {
        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let name = filter.getAsNullableString('name');
        let names = filter.getAsObject('names');
        if (typeof names == 'string')
            names = names.split(',');
        let timeHorizon = TimeHorizonConverter_1.TimeHorizonConverter.fromString(filter.getAsNullableString("time_horizon"));
        let fromRange = TimeRangeComposer_1.TimeRangeComposer.composeFromRangeFromFilter(timeHorizon, filter);
        let toRange = TimeRangeComposer_1.TimeRangeComposer.composeToRangeFromFilter(timeHorizon, filter);
        let dimension1 = filter.getAsNullableString("dimension1");
        if (dimension1 == "*")
            dimension1 = null;
        let dimension2 = filter.getAsNullableString("dimension2");
        if (dimension2 == "*")
            dimension2 = null;
        let dimension3 = filter.getAsNullableString("dimension3");
        if (dimension3 == "*")
            dimension3 = null;
        return (item) => {
            if (name != null && item.name != name)
                return false;
            if (names != null && names.indexOf(item.name) < 0)
                return false;
            if (item.th != timeHorizon)
                return false;
            if (fromRange != TimeHorizonV1_1.TimeHorizonV1.Total && item.rng < fromRange)
                return false;
            if (toRange != TimeHorizonV1_1.TimeHorizonV1.Total && item.rng > toRange)
                return false;
            if (dimension1 != null && item.d1 != dimension1)
                return false;
            if (dimension2 != null && item.d2 != dimension2)
                return false;
            if (dimension3 != null && item.d3 != dimension3)
                return false;
            return true;
        };
    }
    getPageByFilter(correlationId, filter, paging) {
        const _super = Object.create(null, {
            getPageByFilter: { get: () => super.getPageByFilter }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getPageByFilter.call(this, correlationId, this.composeFilter(filter), paging, null, null);
        });
    }
    updateOne(correlationId, update, maxTimeHorizon) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let timeHorizon of this.TimeHorizons) {
                if (timeHorizon > maxTimeHorizon)
                    continue;
                let id = MetricRecordIdComposer_1.MetricRecordIdComposer.composeIdFromUpdate(timeHorizon, update);
                let range = TimeRangeComposer_1.TimeRangeComposer.composeRangeFromUpdate(timeHorizon, update);
                let index = this._items.findIndex((item) => item.id == id);
                let timeIndex = TimeIndexComposer_1.TimeIndexComposer.composeIndexFromUpdate(timeHorizon, update);
                let item;
                if (index < 0) {
                    item = {
                        id: id,
                        name: update.name,
                        th: timeHorizon,
                        rng: range,
                        d1: update.dimension1,
                        d2: update.dimension2,
                        d3: update.dimension3,
                        val: {}
                    };
                    this._items.push(item);
                }
                else {
                    item = this._items[index];
                }
                let value = item.val[timeIndex];
                if (item.val[timeIndex] == null) {
                    value = {
                        cnt: 0,
                        sum: 0,
                        min: update.value,
                        max: update.value
                    };
                    item.val[timeIndex] = value;
                }
                value.cnt += 1;
                value.sum += update.value;
                value.min = Math.min(value.min, update.value);
                value.max = Math.max(value.max, update.value);
            }
            //this._logger.trace(correlationId, 'Updated metric');
            yield this.save(correlationId);
        });
    }
    updateMany(correlationId, updates, maxTimeHorizon) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 0;
            try {
                for (let update of updates) {
                    yield this.updateOne(correlationId, update, maxTimeHorizon);
                    count++;
                }
            }
            catch (err) {
                this._logger.trace(correlationId, 'Updated $n metrics', count);
            }
        });
    }
    deleteByFilter(correlationId, filter) {
        const _super = Object.create(null, {
            deleteByFilter: { get: () => super.deleteByFilter }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.deleteByFilter.call(this, correlationId, this.composeFilter(filter));
        });
    }
}
exports.MetricsMemoryPersistence = MetricsMemoryPersistence;
//# sourceMappingURL=MetricsMemoryPersistence.js.map