import { ConfigParams } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IReconfigurable } from 'pip-services3-commons-nodex';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-nodex';

import { MetricUpdateV1 } from '../data/version1/MetricUpdateV1';
import { TimeHorizonV1 } from '../data/version1/TimeHorizonV1';
import { MetricRecord } from './MetricRecord';
import { MetricRecordValue } from './MetricRecordValue';
import { TimeRangeComposer } from './TimeRangeComposer';
import { TimeIndexComposer } from './TimeIndexComposer';
import { TimeHorizonConverter } from './TimeHorizonConverter';
import { MetricRecordIdComposer } from './MetricRecordIdComposer';
import { IMetricsPersistence } from './IMetricsPersistence';

export class MetricsMemoryPersistence
    extends IdentifiableMemoryPersistence<MetricRecord, string>
    implements IReconfigurable, IMetricsPersistence {

    private readonly TimeHorizons = [
        TimeHorizonV1.Total,
        TimeHorizonV1.Year,
        TimeHorizonV1.Month,
        TimeHorizonV1.Day,
        TimeHorizonV1.Hour,
        TimeHorizonV1.Minute
    ];

    protected _maxPageSize: number = 1000;

    constructor() {
        super();
    }

    public configure(config: ConfigParams): void {
        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();

        let name = filter.getAsNullableString('name');

        let names = filter.getAsObject('names');
        if (typeof names == 'string')
            names = names.split(',');

        let timeHorizon = TimeHorizonConverter.fromString(filter.getAsNullableString("time_horizon"));
        let fromRange = TimeRangeComposer.composeFromRangeFromFilter(timeHorizon, filter);
        let toRange = TimeRangeComposer.composeToRangeFromFilter(timeHorizon, filter);
        let dimension1 = filter.getAsNullableString("dimension1");
        if (dimension1 == "*") dimension1 = null;
        let dimension2 = filter.getAsNullableString("dimension2");
        if (dimension2 == "*") dimension2 = null;
        let dimension3 = filter.getAsNullableString("dimension3");
        if (dimension3 == "*") dimension3 = null;

        return (item) => {
            if (name != null && item.name != name)
                return false;
            if (names != null && names.indexOf(item.name) < 0)
                return false;
            if (item.th != timeHorizon)
                return false;
            if (fromRange != TimeHorizonV1.Total && item.rng < fromRange)
                return false;
            if (toRange != TimeHorizonV1.Total && item.rng > toRange)
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

    public async getPageByFilter(correlationId: string, filter: FilterParams,
        paging: PagingParams): Promise<DataPage<MetricRecord>> {
        return await super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null);
    }

    public async updateOne(correlationId: string, update: MetricUpdateV1, maxTimeHorizon: number): Promise<void> {

        for (let timeHorizon of this.TimeHorizons) {
            if (timeHorizon > maxTimeHorizon)
                continue;

            let id = MetricRecordIdComposer.composeIdFromUpdate(timeHorizon, update);
            let range = TimeRangeComposer.composeRangeFromUpdate(timeHorizon, update);
            let index = this._items.findIndex((item) => item.id == id);

            let timeIndex = TimeIndexComposer.composeIndexFromUpdate(timeHorizon, update);

            let item: MetricRecord;
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
            } else {
                item = this._items[index];
            }

            let value: MetricRecordValue = item.val[timeIndex];
            if (item.val[timeIndex] == null) {
                value = {
                    cnt: 0,
                    sum: 0,
                    min: update.value,
                    max: update.value
                }
                item.val[timeIndex] = value;
            }

            value.cnt += 1;
            value.sum += update.value;
            value.min = Math.min(value.min, update.value);
            value.max = Math.max(value.max, update.value);
        }

        //this._logger.trace(correlationId, 'Updated metric');

        await this.save(correlationId);
    }

    public async updateMany(correlationId: string, updates: MetricUpdateV1[], maxTimeHorizon: number): Promise<void> {
        let count = 0;

        try {
            for (let update of updates) {
                await this.updateOne(correlationId, update, maxTimeHorizon);
                count++;
            }
        } catch(err) {
            this._logger.trace(correlationId, 'Updated $n metrics', count);
        }
    }

    public async deleteByFilter(correlationId: string, filter: FilterParams): Promise<void> {
        await super.deleteByFilter(correlationId, this.composeFilter(filter));
    }

}
