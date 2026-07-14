import { DataSource, type DataSourceOptions } from 'typeorm';
import ormConfig from './orm.config';

const ExternalSisDbSource = new DataSource({
  ...(ormConfig as DataSourceOptions),
});

export { ExternalSisDbSource };
