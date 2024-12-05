import { 
    createUserControllers, 
    deleteUserControllers, 
    getAllUsersControllers, 
    getUserByIdControllers, 
    updateUserControllers
  } from './usersControllers';
  import { registerTag } from '../../../../src/swagger/swaggerTags';

  registerTag('Users', 'Todas las rutas relacionadas a Users');

  Parse.Cloud.define('getAllUsers', getAllUsersControllers(Parse));
  Parse.Cloud.define('getUserById', getUserByIdControllers(Parse), { requireUser: true });
  Parse.Cloud.define('createUser', createUserControllers(Parse));
  Parse.Cloud.define('deleteUser', deleteUserControllers(Parse), { requireUser: true });
  Parse.Cloud.define('updateUser', updateUserControllers(Parse), { requireUser: true });