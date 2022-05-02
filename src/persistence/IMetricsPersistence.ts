import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';

import { MetricUpdateV1 } from '../data/version1/MetricUpdateV1';
import { MetricRecord } from './MetricRecord';

export interface IMetricsPersistence {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<MetricRecord>>;
    set(correlationId: string, item: MetricRecord): Promise<MetricRecord>;
    updateOne(correlationId: string, update: MetricUpdateV1, maxTimeHorizon: number): Promise<void>;
    updateMany(correlationId: string, updates: MetricUpdateV1[], maxTimeHorizon: number): Promise<void>;
    deleteByFilter(correlationId: string, filter: FilterParams): Promise<void>;
}

