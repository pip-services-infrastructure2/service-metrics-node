import { ProcessContainer } from 'pip-services3-container-nodex';
import { DefaultRpcFactory } from 'pip-services3-rpc-nodex';
import { DefaultSwaggerFactory } from 'pip-services3-swagger-nodex';
import { DefaultPrometheusFactory } from 'pip-services3-prometheus-nodex';
import { DefaultElasticSearchFactory } from 'pip-services3-elasticsearch-nodex';
import { MetricsServiceFactory } from '../build/MetricsServiceFactory';

export class MetricsProcess extends ProcessContainer {
    public constructor() {
        super("service-metrics", "Analytical metrics microservice");

        this._factories.add(new DefaultRpcFactory());
        this._factories.add(new DefaultSwaggerFactory());
        this._factories.add(new MetricsServiceFactory());
        this._factories.add(new DefaultElasticSearchFactory());
        this._factories.add(new DefaultPrometheusFactory());
    }
}
