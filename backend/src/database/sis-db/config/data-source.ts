import { DataSource, type DataSourceOptions } from 'typeorm';
import ormConfig from './orm.config';

const SisDbSource = new DataSource({
  ...(ormConfig as DataSourceOptions),
});

export { SisDbSource };
