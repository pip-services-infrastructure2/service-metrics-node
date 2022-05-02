import { ConfigParams } from 'pip-services3-commons-nodex';

import { MetricsFilePersistence } from '../../src/persistence/MetricsFilePersistence';
import { MetricsPersistenceFixture } from './MetricsPersistenceFixture';

suite('MetricsFilePersistence', () => {
    let persistence: MetricsFilePersistence;
    let fixture: MetricsPersistenceFixture;

    setup(async () => {
        persistence = new MetricsFilePersistence('data/metrics.test.json');
        persistence.configure(new ConfigParams());

        fixture = new MetricsPersistenceFixture(persistence);

        await persistence.open(null);
        await persistence.clear(null);
    });

    teardown(async () => {
        await persistence.close(null);
    });

    test('Simple Metrics', async () => {
        await fixture.testSimpleMetrics();
    });

    test('Metric With Dimensions', async () => {
        await fixture.testMetricWithDimensions();
    });

    test('Get Multiple Metrics', async () => {
        await fixture.testGetMultipleMetrics();
    });

});