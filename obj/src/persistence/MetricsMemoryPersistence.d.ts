import { ConfigParams } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IReconfigurable } from 'pip-services3-commons-nodex';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-nodex';
import { MetricUpdateV1 } from '../data/version1/MetricUpdateV1';
import { MetricRecord } from './MetricRecord';
import { IMetricsPersistence } from './IMetricsPersistence';
export declare class MetricsMemoryPersistence extends IdentifiableMemoryPersistence<MetricRecord, string> implements IReconfigurable, IMetricsPersistence {
    private readonly TimeHorizons;
    protected _maxPageSize: number;
    constructor();
    configure(config: ConfigParams): void;
    private composeFilter;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<MetricRecord>>;
    updateOne(correlationId: string, update: MetricUpdateV1, maxTimeHorizon: number): Promise<void>;
    updateMany(correlationId: string, updates: MetricUpdateV1[], maxTimeHorizon: number): Promise<void>;
    deleteByFilter(correlationId: string, filter: FilterParams): Promise<void>;
}
