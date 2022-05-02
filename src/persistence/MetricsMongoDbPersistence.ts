import { ConfigParams } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';

import { MetricUpdateV1 } from '../data/version1/MetricUpdateV1';
import { TimeHorizonV1 } from '../data/version1/TimeHorizonV1';

import { MetricRecord } from './MetricRecord';
import { IMetricsPersistence } from './IMetricsPersistence';
import { TimeHorizonConverter } from './TimeHorizonConverter';
import { TimeRangeComposer } from './TimeRangeComposer';
import { MetricRecordIdComposer } from './MetricRecordIdComposer';
import { TimeIndexComposer } from './TimeIndexComposer';
import { resolve } from 'dns';
import { rejects } from 'assert';

export class MetricsMongoDbPersistence
    extends IdentifiableMongoDbPersistence<MetricRecord, string>
    implements IMetricsPersistence {

    private readonly TimeHorizons = [
        TimeHorizonV1.Total,
        TimeHorizonV1.Year,
        TimeHorizonV1.Month,
        TimeHorizonV1.Day,
        TimeHorizonV1.Hour,
        TimeHorizonV1.Minute
    ];

    protected _maxPageSize: number = 100;

    constructor() {
        super('metrics');
        super.ensureIndex({ name: 1, th: 1, rng: -1 });
        super.ensureIndex({ d1: 1 });
        super.ensureIndex({ d2: 1 });
        super.ensureIndex({ d3: 1 });
    }

    public configure(config: ConfigParams) {
        super.configure(config);

        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
    }

    private composeFilter(filterParams: FilterParams): any {
        filterParams = filterParams || new FilterParams();

        let criteria = [];

        let name = filterParams.getAsNullableString("name");
        if (name != null) {
            criteria.push({ name: name });
        }

        let names = filterParams.getAsObject('names');
        if (typeof names == 'string')
            names = names.split(',');
        if (Array.isArray(names))
            criteria.push({ name: { $in: names } });

        let timeHorizon = TimeHorizonConverter.fromString(filterParams.getAsNullableString("time_horizon"));
        criteria.push({ th: timeHorizon });

        let fromRange = TimeRangeComposer.composeFromRangeFromFilter(timeHorizon, filterParams);
        if (fromRange != TimeHorizonV1.Total) {
            criteria.push({ rng: { $gte: fromRange } });
        }
        let toRange = TimeRangeComposer.composeToRangeFromFilter(timeHorizon, filterParams);
        if (toRange != TimeHorizonV1.Total) {
            criteria.push({ rng: { $lte: toRange } });
        }
        let dimension1 = filterParams.getAsNullableString("dimension1");
        if (dimension1 != null && dimension1 != "*") {
            criteria.push({ d1: dimension1 });
        }

        let dimension2 = filterParams.getAsNullableString("dimension2");
        if (dimension2 != null && dimension2 != "*") {
            criteria.push({ d2: dimension2 });
        }

        let dimension3 = filterParams.getAsNullableString("dimension3");
        if (dimension3 != null && dimension3 != "*") {
            criteria.push({ d3: dimension3 });
        }

        return criteria.length > 0 ? { $and: criteria } : null;
    }

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<MetricRecord>> {
        return await super.getPageByFilter(correlationId, this.composeFilter(filter), paging, "name,rng,d1,d2,d3", null);
    }

    public async updateOne(correlationId: string, update: MetricUpdateV1, maxTimeHorizon: TimeHorizonV1): Promise<void> {
        await this.updateMany(correlationId, [update], maxTimeHorizon);
    }

    public async updateMany(correlationId: string, updates: MetricUpdateV1[],
        maxTimeHorizon: TimeHorizonV1): Promise<void> {
        let batch = this._collection.initializeUnorderedBulkOp();
        let opCounter = 0;
        
        for (let update of updates) {
            for (let timeHorizon of this.TimeHorizons) {
                if (timeHorizon > maxTimeHorizon)
                    continue;

                let id = MetricRecordIdComposer.composeIdFromUpdate(timeHorizon, update);
                let range = TimeRangeComposer.composeRangeFromUpdate(timeHorizon, update);
                let timeIndex = TimeIndexComposer.composeIndexFromUpdate(timeHorizon, update);
                opCounter += opCounter;

                // Add to bulk operations
                batch
                    .find({ _id: id })
                    .upsert()
                    .updateOne({
                        $setOnInsert: {
                            name: update.name,
                            th: timeHorizon,
                            rng: range,
                            d1: update.dimension1,
                            d2: update.dimension2,
                            d3: update.dimension3
                        },
                        $inc: {
                            ["val." + timeIndex + ".cnt"]: 1,
                            ["val." + timeIndex + ".sum"]: update.value
                        },
                        $min: { ["val." + timeIndex + ".min"]: update.value },
                        $max: { ["val." + timeIndex + ".max"]: update.value }
                    });
            }

            if (opCounter >= 200) {
                await new Promise((resolve, reject) => {
                    batch.execute((err) => {
                        if (err) reject(err) 
                        opCounter = 0;
                        batch = this._collection.initializeUnorderedBulkOp();
                        resolve(null);
                    });
                });
            }

            if (opCounter >= 0) {
                await new Promise((resolve, reject) => {
                    batch.execute((err) => {
                        if (err) reject(err) 
                        this._logger.trace(correlationId, 'Updated %d metrics', updates.length);
                        resolve(null);
                    });
                });
                
            }
        }
    }

    public async deleteByFilter(correlationId: string, filter: FilterParams): Promise<void> {
        await super.deleteByFilter(correlationId, this.composeFilter(filter));
    }

}
