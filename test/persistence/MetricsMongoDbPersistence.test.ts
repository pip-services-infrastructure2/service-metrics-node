import { ConfigParams } from 'pip-services3-commons-nodex';

import { MetricsMongoDbPersistence } from '../../src/persistence/MetricsMongoDbPersistence';
import { MetricsPersistenceFixture } from './MetricsPersistenceFixture';

suite('MetricsMongoDbPersistence', () => {
    let persistence: MetricsMongoDbPersistence;
    let fixture: MetricsPersistenceFixture;

    let mongoUri = process.env['MONGO_SERVICE_URI'];
    let mongoHost = process.env['MONGO_SERVICE_HOST'] || 'localhost';
    let mongoPort = process.env['MONGO_SERVICE_PORT'] || 27017;
    let mongoDatabase = process.env['MONGO_SERVICE_DB'] || 'test';

    // Exit if mongo connection is not set
    if (mongoUri == '' && mongoHost == '')
        return;

    setup(async () => {
        persistence = new MetricsMongoDbPersistence();
        persistence.configure(ConfigParams.fromTuples(
            'connection.uri', mongoUri,
            'connection.host', mongoHost,
            'connection.port', mongoPort,
            'connection.database', mongoDatabase
        ));

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
