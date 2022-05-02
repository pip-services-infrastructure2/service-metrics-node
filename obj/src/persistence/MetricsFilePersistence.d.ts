import { ConfigParams } from 'pip-services3-commons-nodex';
import { JsonFilePersister } from 'pip-services3-data-nodex';
import { MetricsMemoryPersistence } from './MetricsMemoryPersistence';
import { MetricRecord } from './MetricRecord';
export declare class MetricsFilePersistence extends MetricsMemoryPersistence {
    protected _persister: JsonFilePersister<MetricRecord>;
    constructor(path?: string);
    configure(config: ConfigParams): void;
}
