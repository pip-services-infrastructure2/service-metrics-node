import { CommandSet } from 'pip-services3-commons-nodex';
import { ICommand } from 'pip-services3-commons-nodex';
import { Command } from 'pip-services3-commons-nodex';
import { ObjectSchema } from 'pip-services3-commons-nodex'
import { FilterParamsSchema } from 'pip-services3-commons-nodex';
import { PagingParamsSchema } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';
import { ArraySchema } from 'pip-services3-commons-nodex';
import { Parameters } from 'pip-services3-commons-nodex';

import { IMetricsController } from './IMetricsController';
import { MetricUpdateV1Schema } from '../data/version1/MetricUpdateV1Schema';
import { TimeHorizonV1 } from '../data/version1/TimeHorizonV1';

export class MetricsCommandSet extends CommandSet {
    private _controller: IMetricsController;

    constructor(controller: IMetricsController) {
        super();
        this._controller = controller;

        this.addCommand(this.makeGetMetricDefinitionsCommand());
        this.addCommand(this.makeGetMetricDefinitionByNameCommand());
        this.addCommand(this.makeGetMetricsByFilterCommand());
        this.addCommand(this.makeUpdateMetricCommand());
        this.addCommand(this.makeUpdateMetricsCommand());
    }

    private makeGetMetricDefinitionsCommand(): ICommand {
        return new Command(
            "get_metric_definitions",
            new ObjectSchema(),
            async (correlationId: string, args: Parameters) => {
                return await this._controller.getMetricDefinitions(correlationId);
            });
    }

    private makeGetMetricDefinitionByNameCommand(): ICommand {
        return new Command(
            "get_metric_definition_by_name",
            new ObjectSchema()
                .withOptionalProperty("name", TypeCode.String),
            async (correlationId: string, args: Parameters) => {
                let name = args.getAsString("name");

                return await this._controller.getMetricDefinitionByName(correlationId, name);
            });
    }

    private makeGetMetricsByFilterCommand(): ICommand {
        return new Command(
            "get_metrics_by_filter",
            new ObjectSchema(true)
                .withOptionalProperty("filter", new FilterParamsSchema())
                .withOptionalProperty("paging", new PagingParamsSchema()),
            async (correlationId: string, args: Parameters) => {
                let filter = FilterParams.fromValue(args.get("filter"));
                let paging = PagingParams.fromValue(args.get("paging"));

                return await this._controller.getMetricsByFilter(correlationId, filter, paging);
            });
    }

    private makeUpdateMetricCommand(): ICommand {
        return new Command(
            "update_metric",
            new ObjectSchema(true)
                .withRequiredProperty("update", new MetricUpdateV1Schema())
                .withOptionalProperty("max_time_horizon", TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let update = args.getAsObject("update");
                let maxTimeHorizon = args.getAsIntegerWithDefault("max_time_horizon", TimeHorizonV1.Hour);

                return await this._controller.updateMetric(correlationId, update, maxTimeHorizon);
            });
    }

    private makeUpdateMetricsCommand(): ICommand {
        return new Command(
            "update_metrics",
            new ObjectSchema(true)
                .withRequiredProperty("updates", new ArraySchema(new MetricUpdateV1Schema()))
                .withOptionalProperty("max_time_horizon", TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let updates = args.getAsArray("updates");
                let maxTimeHorizon = args.getAsIntegerWithDefault("max_time_horizon", TimeHorizonV1.Hour);

                return await this._controller.updateMetrics(correlationId, updates, maxTimeHorizon);
            });
    }
}

