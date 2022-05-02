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
exports.MetricsCommandSet = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_7 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_8 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_9 = require("pip-services3-commons-nodex");
const MetricUpdateV1Schema_1 = require("../data/version1/MetricUpdateV1Schema");
const TimeHorizonV1_1 = require("../data/version1/TimeHorizonV1");
class MetricsCommandSet extends pip_services3_commons_nodex_1.CommandSet {
    constructor(controller) {
        super();
        this._controller = controller;
        this.addCommand(this.makeGetMetricDefinitionsCommand());
        this.addCommand(this.makeGetMetricDefinitionByNameCommand());
        this.addCommand(this.makeGetMetricsByFilterCommand());
        this.addCommand(this.makeUpdateMetricCommand());
        this.addCommand(this.makeUpdateMetricsCommand());
    }
    makeGetMetricDefinitionsCommand() {
        return new pip_services3_commons_nodex_2.Command("get_metric_definitions", new pip_services3_commons_nodex_3.ObjectSchema(), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this._controller.getMetricDefinitions(correlationId);
        }));
    }
    makeGetMetricDefinitionByNameCommand() {
        return new pip_services3_commons_nodex_2.Command("get_metric_definition_by_name", new pip_services3_commons_nodex_3.ObjectSchema()
            .withOptionalProperty("name", pip_services3_commons_nodex_8.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let name = args.getAsString("name");
            return yield this._controller.getMetricDefinitionByName(correlationId, name);
        }));
    }
    makeGetMetricsByFilterCommand() {
        return new pip_services3_commons_nodex_2.Command("get_metrics_by_filter", new pip_services3_commons_nodex_3.ObjectSchema(true)
            .withOptionalProperty("filter", new pip_services3_commons_nodex_4.FilterParamsSchema())
            .withOptionalProperty("paging", new pip_services3_commons_nodex_5.PagingParamsSchema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_6.FilterParams.fromValue(args.get("filter"));
            let paging = pip_services3_commons_nodex_7.PagingParams.fromValue(args.get("paging"));
            return yield this._controller.getMetricsByFilter(correlationId, filter, paging);
        }));
    }
    makeUpdateMetricCommand() {
        return new pip_services3_commons_nodex_2.Command("update_metric", new pip_services3_commons_nodex_3.ObjectSchema(true)
            .withRequiredProperty("update", new MetricUpdateV1Schema_1.MetricUpdateV1Schema())
            .withOptionalProperty("max_time_horizon", pip_services3_commons_nodex_8.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let update = args.getAsObject("update");
            let maxTimeHorizon = args.getAsIntegerWithDefault("max_time_horizon", TimeHorizonV1_1.TimeHorizonV1.Hour);
            return yield this._controller.updateMetric(correlationId, update, maxTimeHorizon);
        }));
    }
    makeUpdateMetricsCommand() {
        return new pip_services3_commons_nodex_2.Command("update_metrics", new pip_services3_commons_nodex_3.ObjectSchema(true)
            .withRequiredProperty("updates", new pip_services3_commons_nodex_9.ArraySchema(new MetricUpdateV1Schema_1.MetricUpdateV1Schema()))
            .withOptionalProperty("max_time_horizon", pip_services3_commons_nodex_8.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let updates = args.getAsArray("updates");
            let maxTimeHorizon = args.getAsIntegerWithDefault("max_time_horizon", TimeHorizonV1_1.TimeHorizonV1.Hour);
            return yield this._controller.updateMetrics(correlationId, updates, maxTimeHorizon);
        }));
    }
}
exports.MetricsCommandSet = MetricsCommandSet;
//# sourceMappingURL=MetricsCommandSet.js.map