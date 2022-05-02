import { ConfigParams } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';
import { MetricUpdateV1 } from '../data/version1/MetricUpdateV1';
import { TimeHorizonV1 } from '../data/version1/TimeHorizonV1';
import { MetricRecord } from './MetricRecord';
import { IMetricsPersistence } from './IMetricsPersistence';
export declare class MetricsMongoDbPersistence extends IdentifiableMongoDbPersistence<MetricRecord, string> implements IMetricsPersistence {
    private readonly TimeHorizons;
    protected _maxPageSize: number;
    constructor();
    configure(config: ConfigParams): void;
    private composeFilter;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<MetricRecord>>;
    updateOne(correlationId: string, update: MetricUpdateV1, maxTimeHorizon: TimeHorizonV1): Promise<void>;
    updateMany(correlationId: string, updates: MetricUpdateV1[], maxTimeHorizon: TimeHorizonV1): Promise<void>;
    deleteByFilter(correlationId: string, filter: FilterParams): Promise<void>;
}
