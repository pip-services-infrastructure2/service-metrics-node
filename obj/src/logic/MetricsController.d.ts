import { ConfigParams } from 'pip-services3-commons-nodex';
import { ICommandable } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { CommandSet } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { MetricDefinitionV1 } from '../data/version1/MetricDefinitionV1';
import { MetricUpdateV1 } from '../data/version1/MetricUpdateV1';
import { MetricValueSetV1 } from '../data/version1/MetricValueSetV1';
import { IMetricsController } from './IMetricsController';
export declare class MetricsController implements ICommandable, IMetricsController, IConfigurable, IReferenceable {
    private _defaultConfig;
    private _persistence;
    private _commandSet;
    private _dependencyResolver;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getCommandSet(): CommandSet;
    private getMetricDefinitionsWithName;
    getMetricDefinitions(correlationId: string): Promise<MetricDefinitionV1[]>;
    getMetricDefinitionByName(correlationId: string, name: string): Promise<MetricDefinitionV1>;
    getMetricsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<MetricValueSetV1>>;
    updateMetric(correlationId: string, update: MetricUpdateV1, maxTimeHorizon: number): Promise<void>;
    updateMetrics(correlationId: string, updates: MetricUpdateV1[], maxTimeHorizon: number): Promise<void>;
}
