import { createDataController } from '../controllers/seederControllers';

//Parse.Cloud.define('createData', createDataController(Parse), { requireUser: true });
Parse.Cloud.define('createData', createDataController(Parse));
