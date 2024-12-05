import { 
    createContentControllers, 
    deleteContentControllers, 
    getAllContentsControllers, 
    getContentByIdControllers, 
    updateContentControllers
  } from './contentsControllers';
  import { registerTag } from '../../../../src/swagger/swaggerTags';

  registerTag('Contents', 'Todas las rutas relacionadas a Contents');

  Parse.Cloud.define('getAllContents', getAllContentsControllers(Parse));
  Parse.Cloud.define('getContentById', getContentByIdControllers(Parse), { requireUser: true });
  Parse.Cloud.define('createContent', createContentControllers(Parse));
  Parse.Cloud.define('deleteContent', deleteContentControllers(Parse), { requireUser: true });
  Parse.Cloud.define('updateContent', updateContentControllers(Parse), { requireUser: true });