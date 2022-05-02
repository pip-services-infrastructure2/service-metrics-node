import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableHttpService } from 'pip-services3-rpc-nodex';

export class MetricsHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super("v1/metrics");
        this._dependencyResolver.put("controller", new Descriptor("service-metrics", "controller", "default", "*", "1.0"));
    }
}

