import { ConfigParams } from 'pip-services3-commons-nodex';
import { ICommandable } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex'
import { DependencyResolver } from 'pip-services3-commons-nodex';
import { CommandSet } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';

import { MetricDefinitionV1 } from '../data/version1/MetricDefinitionV1';
import { MetricUpdateV1 } from '../data/version1/MetricUpdateV1';
import { MetricValueSetV1 } from '../data/version1/MetricValueSetV1';
import { MetricValueV1 } from '../data/version1/MetricValueV1';
import { IMetricsPersistence } from '../persistence/IMetricsPersistence';
import { TimeHorizonConverter } from '../persistence/TimeHorizonConverter';
import { TimeIndexComposer } from '../persistence/TimeIndexComposer';
import { TimeParser } from '../persistence/TimeParser';

import { MetricsCommandSet } from './MetricsCommandSet';
import { IMetricsController } from './IMetricsController';

export class MetricsController
    implements ICommandable, IMetricsController, IConfigurable, IReferenceable {

    private _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "dependencies.persistence", "service-metrics:persistence:*:*:1.0"
    );

    private _persistence: IMetricsPersistence;
    private _commandSet: MetricsCommandSet;
    private _dependencyResolver: DependencyResolver;

    constructor() {
        this._dependencyResolver = new DependencyResolver(this._defaultConfig);
    }

    public configure(config: ConfigParams): void {
        this._dependencyResolver.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);

        this._persistence = this._dependencyResolver.getOneRequired<IMetricsPersistence>("persistence");
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null) {
            this._commandSet = new MetricsCommandSet(this);
        }
        return this._commandSet;
    }

    private async getMetricDefinitionsWithName(correlationId: string, name: string): Promise<MetricDefinitionV1[]> {

        let filter = FilterParams.fromTuples(
            "name", name,
            "time_horizon", 0
        );

        let take = 500;
        let paging = new PagingParams(0, take);

        let definitions = {};
        let reading: boolean = true;
        
        while (reading) {
            let page = await this._persistence.getPageByFilter(correlationId, filter, paging);

            for (let record of page.data) {
                let definition: MetricDefinitionV1 = definitions[record.name];
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

        let values = Object.values<MetricDefinitionV1>(definitions);

        return values;
    }

    public async getMetricDefinitions(correlationId: string): Promise<MetricDefinitionV1[]> {
        return await this.getMetricDefinitionsWithName(correlationId, null);
    }

    public async getMetricDefinitionByName(correlationId: string, name: string): Promise<MetricDefinitionV1> {
        let items = await this.getMetricDefinitionsWithName(correlationId, name);
        return items.length > 0 ? items[0] : null;
    }

    public async getMetricsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<MetricValueSetV1>> {
        let page = await this._persistence.getPageByFilter(correlationId, filter, paging);
        

        let timeHorizon = TimeHorizonConverter.fromString(filter.getAsNullableString("time_horizon"));
        let fromIndex = TimeIndexComposer.composeFromIndexFromFilter(timeHorizon, filter);
        let toIndex = TimeIndexComposer.composeToIndexFromFilter(timeHorizon, filter);

        // Convert records into value sets
        let sets = {};

        for (let record of page.data) {
            // Generate index
            let id = record.name + "_" + (record.d1 || "")
                + "_" + (record.d2 || "")
                + "_" + (record.d3 || "");

            // Get or create value set
            let set: MetricValueSetV1 = sets[id];
            if (set == null) {
                set = {
                    name: record.name,
                    time_horizon: record.th,
                    dimension1: record.d1,
                    dimension2: record.d2,
                    dimension3: record.d3,
                    values: []
                }
                sets[id] = set;
            }

            for (let key in record.val) {
                if (key < fromIndex || key > toIndex)
                    continue;

                let value = new MetricValueV1();
                TimeParser.parseTime(key, timeHorizon, value);
                value.count = record.val[key].cnt;
                value.sum = record.val[key].sum;
                value.min = record.val[key].min;
                value.max = record.val[key].max;

                set.values.push(value);
            };
        }

        let total = page.total;
        let values = Object.values<MetricValueSetV1>(sets);

        return new DataPage<MetricValueSetV1>(values, total);
    }

    public async updateMetric(correlationId: string, update: MetricUpdateV1,
        maxTimeHorizon: number): Promise<void> {
        await this._persistence.updateOne(correlationId, update, maxTimeHorizon);
    }

    public async updateMetrics(correlationId: string, updates: MetricUpdateV1[],
        maxTimeHorizon: number): Promise<void> {
        await this._persistence.updateMany(correlationId, updates, maxTimeHorizon);
    }

}