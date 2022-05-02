import { ConfigParams } from 'pip-services3-commons-nodex';

import { MetricsMemoryPersistence } from '../../src/persistence/MetricsMemoryPersistence';
import { MetricsPersistenceFixture } from './MetricsPersistenceFixture';

suite('MetricsMemoryPersistence', () => {
    let persistence: MetricsMemoryPersistence;
    let fixture: MetricsPersistenceFixture;

    setup(async () => {
        persistence = new MetricsMemoryPersistence();
        persistence.configure(new ConfigParams());

        fixture = new MetricsPersistenceFixture(persistence);

        await persistence.open(null);
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