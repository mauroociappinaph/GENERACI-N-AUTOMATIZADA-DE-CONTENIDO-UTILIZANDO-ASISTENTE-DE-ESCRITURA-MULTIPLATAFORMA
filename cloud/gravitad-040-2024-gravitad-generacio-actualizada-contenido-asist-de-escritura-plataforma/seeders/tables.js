import config from '../../../src/config';

import { loadMassiveDataUsers } from './loadMassiveData/loadMassiveDataUsers';

import { loadMassiveDataProjects } from './loadMassiveData/loadMassiveDataProjects';

const urlBase = `cloud/${config.APP_DIR}/seeders/seederJson`;

export const tablesToLoad = [
  { tableName: 'users', filePath: `${urlBase}/users.json`, loadFunction: loadMassiveDataUsers },
  { tableName: 'projects', filePath: `${urlBase}/projects.json`, loadFunction: loadMassiveDataProjects },
];