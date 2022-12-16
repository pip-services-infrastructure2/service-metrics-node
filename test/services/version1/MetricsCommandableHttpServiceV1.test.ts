const assert = require('chai').assert;
const restify = require('restify');

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';

import { MetricsMemoryPersistence } from '../../../src/persistence/MetricsMemoryPersistence';
import { MetricsController } from '../../../src/logic/MetricsController';
import { MetricsCommandableHttpServiceV1 } from '../../../src/services/version1/MetricsCommandableHttpServiceV1';
import { MetricDefinitionV1 } from '../../../src/data/version1/MetricDefinitionV1';
import { TimeHorizonV1 } from '../../../src/data/version1/TimeHorizonV1';
import { MetricUpdateV1 } from '../../../src/data/version1/MetricUpdateV1';
import { MetricValueSetV1 } from '../../../src/data/version1/MetricValueSetV1';


suite('MetricsHttpServiceV1', () => {
    let persistence: MetricsMemoryPersistence;
    let controller: MetricsController;
    let service: MetricsCommandableHttpServiceV1;
    let rest: any;

    setup(async () => {
        let url = "http://localhost:3000";
        rest = restify.createJsonClient({ url: url, version: '*' });

        persistence = new MetricsMemoryPersistence();
        persistence.configure(new ConfigParams());

        controller = new MetricsController();
        controller.configure(new ConfigParams());

        service = new MetricsCommandableHttpServiceV1();
        service.configure(ConfigParams.fromTuples(
            'connection.protocol', 'http',
            'connection.port', 3000,
            'connection.host', 'localhost'
        ));

        let references = References.fromTuples(
            new Descriptor('service-metrics', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-metrics', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('service-metrics', 'service', 'commandable-http', 'default', '1.0'), service
        );

        controller.setReferences(references);
        service.setReferences(references);

        await persistence.open(null);
        await service.open(null);
    });

    teardown(async () => {
        await service.close(null);
        await persistence.close(null);
    });


    test('TestMetrics', async () => {
        // Update metric once
        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/metrics/update_metric',
                {
                    update: <MetricUpdateV1>{
                        name: "metric1",
                        dimension1: "A",
                        dimension2: "B",
                        dimension3: null,
                        year: 2018,
                        month: 8,
                        day: 26,
                        hour: 12,
                        value: 123
                    },
                    max_time_horizon: TimeHorizonV1.Hour
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        // Update metric second time
        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/metrics/update_metrics',
                {
                    updates: [
                        <MetricUpdateV1>{
                            name: "metric1",
                            dimension1: "A",
                            dimension2: "B",
                            dimension3: null,
                            year: 2018,
                            month: 8,
                            day: 26,
                            hour: 13,
                            value: 321
                        }
                    ],
                    max_time_horizon: TimeHorizonV1.Hour
                }, 
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        // Get total metric
        let page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/metrics/get_metrics_by_filter',
                {
                    filter: FilterParams.fromTuples("name", "metric1"),
                    paging: new PagingParams()
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isObject(page);
        assert.equal(1, page.data.length);
        let set: MetricValueSetV1;
        set = page.data[0];
        assert.equal("metric1", set.name);
        assert.equal(TimeHorizonV1.Total, set.time_horizon);
        assert.equal("A", set.dimension1);
        assert.equal("B", set.dimension2);
        assert.isNull(set.dimension3);
        assert.equal(1, set.values.length);
        let value = set.values[0];
        assert.equal(444, value.sum);
        assert.equal(123, value.min);
        assert.equal(321, value.max);
        assert.equal(2, value.count);

        // Get hour metric
        page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/metrics/get_metrics_by_filter',
                {
                    filter: FilterParams.fromTuples(
                        "name", "metric1",
                        "time_horizon", "hour",
                        "from_year", 2018,
                        "from_month", 8,
                        "from_day", 26,
                        "from_hour", 0,
                        "to_year", 2018,
                        "to_month", 8,
                        "to_day", 26,
                        "to_hour", 23
                    ),
                    paging: new PagingParams()
                }, 
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.equal(1, page.data.length);
        set = page.data[0];
        assert.equal("metric1", set.name);
        assert.equal(TimeHorizonV1.Hour, set.time_horizon);
        assert.equal("A", set.dimension1);
        assert.equal("B", set.dimension2);
        assert.isNull(set.dimension3);

        assert.equal(2, set.values.length);
        value = set.values[0];
        assert.equal(2018, value.year);
        assert.equal(8, value.month);
        assert.equal(26, value.day);
        assert.equal(12, value.hour);
        assert.equal(123, value.sum);
        assert.equal(123, value.min);
        assert.equal(123, value.max);
        assert.equal(1, value.count);

        value = set.values[1];
        assert.equal(2018, value.year);
        assert.equal(8, value.month);
        assert.equal(26, value.day);
        assert.equal(13, value.hour);
        assert.equal(321, value.sum);
        assert.equal(321, value.min);
        assert.equal(321, value.max);
        assert.equal(1, value.count);
    });

    test('TestDefinitions', async () => {
        // Update metric once
        let metric1 = new MetricUpdateV1();

        metric1.name = "metric2";
        metric1.dimension1 = "A";
        metric1.dimension2 = "B";
        metric1.dimension3 = null;
        metric1.year = 2018;
        metric1.month = 8;
        metric1.day = 26;
        metric1.hour = 12;
        metric1.value = 123;

        let metric2 = new MetricUpdateV1()

        metric2.name = "metric2";
        metric2.dimension1 = "A";
        metric2.dimension2 = "C";
        metric2.dimension3 = null;
        metric2.year = 2018;
        metric2.month = 8;
        metric2.day = 26;
        metric2.hour = 13;
        metric2.value = 321;

        let updateMetrics = new Array<MetricUpdateV1>();
        updateMetrics.push(metric1, metric2);

        // Update metric second time
        //controller.updateMetrics(null, updateMetrics, TimeHorizonV1.Hour);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/metrics/update_metrics',
                {
                    updates: [
                        <MetricUpdateV1>{
                            name: "metric2",
                            dimension1: "A",
                            dimension2: "B",
                            dimension3: null,
                            year: 2018,
                            month: 8,
                            day: 26,
                            hour: 12,
                            value: 123
                        },
                        <MetricUpdateV1>{
                            name: "metric2",
                            dimension1: "A",
                            dimension2: "C",
                            dimension3: null,
                            year: 2018,
                            month: 8,
                            day: 26,
                            hour: 13,
                            value: 321
                        }
                    ],
                    max_time_horizon: TimeHorizonV1.Hour
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        // Get all definitions
        //controller.getMetricDefinitions(null, (err, definitions) => {
        let definitions = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/metrics/get_metric_definitions', null,
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.equal(1, definitions.length);
        let definition: MetricDefinitionV1;
        definition = definitions[0];
        assert.equal("metric2", definition.name);
        assert.equal(1, definition.dimension1.length);
        assert.equal("A", definition.dimension1[0]);
        assert.equal(2, definition.dimension2.length);
        assert.equal("B", definition.dimension2[0]);
        assert.equal("C", definition.dimension2[1]);
        assert.empty(definition.dimension3);

        // Get a single definition
        definition = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/metrics/get_metric_definition_by_name', null,
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.equal("metric2", definition.name);
    });

});