import {
  registerTableFromJSON,
  deleteTableFromJSON,
  getAllTableFromJSON,
  getTableFromJSONById,
  updateTableFromJSON,
} from '../controllers/tableFromJSONControllers';

Parse.Cloud.define('registerTableFromJSON', registerTableFromJSON(Parse));
Parse.Cloud.define('getAllTableFromJSON', getAllTableFromJSON(Parse));
Parse.Cloud.define('getTableFromJSONById', getTableFromJSONById(Parse));
Parse.Cloud.define('updateTableFromJSON', updateTableFromJSON(Parse));
Parse.Cloud.define('deleteTableFromJSON', deleteTableFromJSON(Parse));
