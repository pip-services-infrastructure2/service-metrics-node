import { Benchmark } from 'pip-benchmark-node';
import { DateTimeConverter } from 'pip-services3-commons-nodex';

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';

import { MetricUpdateV1 } from '../src/data/version1/MetricUpdateV1';
import { MetricsMongoDbPersistence } from '../src/persistence/MetricsMongoDbPersistence';
import { MetricsController } from '../src/logic/MetricsController';

export class UpdateMetricsBenchmark extends Benchmark {
    private _initialRecordNumber: number;
    private _metricNumber: number;
    private _dimensionNumber: number;
    private _updateNumber: number;
    private _maxTimeHorizon: number;
    private _startTime: Date;
    private _time: Date;

    private _persistence: MetricsMongoDbPersistence;
    private _controller: MetricsController;

    public constructor() {
        super("UpdateMetricsBenchmark", "Measures performance of updating metrics in MongoDB database");
    }

    public async setUp(): Promise<void> {
        this._initialRecordNumber = this.context.parameters.InitialRecordNumber.getAsInteger();
        this._metricNumber = this.context.parameters.MetricNumber.getAsInteger();
        this._dimensionNumber = this.context.parameters.DimensionNumber.getAsInteger();
        this._updateNumber = this.context.parameters.UpdateNumber.getAsInteger();
        this._maxTimeHorizon = this.context.parameters.MaxTimeHorizon.getAsInteger();
        this._startTime = DateTimeConverter.toDateTime(this.context.parameters.StartTime.getAsString());

        this._time = this._startTime;

        let mongoUri = this.context.parameters.MongoUri.getAsString();
        let mongoHost = this.context.parameters.MongoHost.getAsString();
        let mongoPort = this.context.parameters.MongoPort.getAsInteger();
        let mongoDb = this.context.parameters.MongoDb.getAsString();

        this._persistence = new MetricsMongoDbPersistence();
        this._persistence.configure(ConfigParams.fromTuples(
            'connection.uri', mongoUri,
            'connection.host', mongoHost,
            'connection.port', mongoPort,
            'connection.database', mongoDb
        ));

        this._controller = new MetricsController();
        this._controller.configure(ConfigParams.fromTuples(
            'options.interval', 5 // Set interval to 5 mins
        ));

        let references: References = References.fromTuples(
            new Descriptor('service-metrics', 'persistence', 'mongodb', 'default', '1.0'), this._persistence,
            new Descriptor('service-metrics', 'controller', 'default', 'default', '1.0'), this._controller
        );
        this._controller.setReferences(references);

        await this._persistence.open(null);
        this.context.sendMessage('Connected to mongodb database');
    }

    public async tearDown(): Promise<void> {
        await this._persistence.close(null);
        this.context.sendMessage('Disconnected from mongodb database');

        this._persistence = null;
        this._controller = null;
    }

    private getRandomMetric() {
        return "metric" + Math.trunc(Math.random() * this._metricNumber + 1);
    }

    private getRandomDimension() {
        return "dim" + Math.trunc(Math.random() * this._dimensionNumber + 1);
    }

    private getRandomUpdate(): MetricUpdateV1 {
        return <MetricUpdateV1> {
            name: this.getRandomMetric(),
            year: this._time.getFullYear(),
            month: this._time.getMonth(),
            day: this._time.getDate(),
            hour: this._time.getHours(),
            minute: this._time.getMinutes(),
            dimension1: this.getRandomDimension(),
            dimension2: this.getRandomDimension(),
            dimension3: this.getRandomDimension(),
            value: Math.random() * 100
        };
    }

    private getRandomUpdates(): MetricUpdateV1[] {
        let updates: MetricUpdateV1[] = [];
        for (let i = 0; i < this._updateNumber; i++)
            updates[i] = this.getRandomUpdate();
        return updates;
    }

    public async execute(): Promise<void> {
        let updates = this.getRandomUpdates();
        await this._controller.updateMetrics(null, updates, this._maxTimeHorizon);
    }

}