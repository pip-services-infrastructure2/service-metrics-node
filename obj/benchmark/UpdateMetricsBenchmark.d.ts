import { Benchmark } from 'pip-benchmark-node';
export declare class UpdateMetricsBenchmark extends Benchmark {
    private _initialRecordNumber;
    private _metricNumber;
    private _dimensionNumber;
    private _updateNumber;
    private _maxTimeHorizon;
    private _startTime;
    private _time;
    private _persistence;
    private _controller;
    constructor();
    setUp(): Promise<void>;
    tearDown(): Promise<void>;
    private getRandomMetric;
    private getRandomDimension;
    private getRandomUpdate;
    private getRandomUpdates;
    execute(): Promise<void>;
}
