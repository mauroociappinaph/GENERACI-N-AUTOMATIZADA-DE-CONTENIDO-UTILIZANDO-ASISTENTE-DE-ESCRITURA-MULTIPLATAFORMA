import config from '../../../src/config';

import { loadMassiveDataContents } from './loadMassiveData/loadMassiveDataContents';

const urlBase = `cloud/${config.APP_DIR}/seeders/seederJson`;

export const tablesToLoad = [
  { tableName: 'contents', filePath: `${urlBase}/contents.json`, loadFunction: loadMassiveDataContents },
];