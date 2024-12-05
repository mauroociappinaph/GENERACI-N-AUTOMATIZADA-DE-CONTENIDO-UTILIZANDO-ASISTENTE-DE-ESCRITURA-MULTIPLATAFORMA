import {
    createContentServices,
    deleteContentServices,
    getAllContentsServices,
    getContentByIdServices,
    updateContentServices,
  } from './contentsServices';

  export function getAllContentsControllers(Parse) {
    return async (request) => {
      try {
        const { page } = request.params;
        const contents = await getAllContentsServices(page);

        return contents;
      } catch (error) {
        console.error(`Error code: ${error.code}, Error message: ${error.message}`);
        return {
          status: 'error',
          result: false,
          errorDetails: {
            code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
            message: error.message,
          },
        };
      }
    };
  }

  export function getContentByIdControllers(Parse) {
    return async (request) => {
      try {
        const { contentId } = request.params;
        const content = await getContentByIdServices(contentId);

        return {
          status: 'success',
          result: true,
          content,
        };
      } catch (error) {
        console.error(`Error code: ${error.code}, Error message: ${error.message}`);
        return {
          status: 'error',
          result: false,
          errorDetails: {
            code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
            message: error.message,
          },
        };
      }
    };
  }

  export function createContentControllers(Parse) {
    return async (request) => {
      try {
        const { objectData } = request.params;
        const content = await createContentServices(objectData);

        return {
          status: 'success',
          result: true,
          content,
        };
      } catch (error) {
        console.error(`Error code: ${error.code}, Error message: ${error.message}`);
        return {
          status: 'error',
          result: false,
          errorDetails: {
            code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
            message: error.message,
          },
        };
      }
    };
  }

  export function updateContentControllers(Parse) {
    return async (request) => {
      try {
        const { contentId, objectData } = request.params;
        const content = await updateContentServices(contentId, objectData);

        return {
          status: 'success',
          result: true,
          content,
        };
      } catch (error) {
        console.error(`Error code: ${error.code}, Error message: ${error.message}`);
        return {
          status: 'error',
          result: false,
          errorDetails: {
            code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
            message: error.message,
          },
        };
      }
    };
  }

  export function deleteContentControllers(Parse) {
    return async (request) => {
      try {
        const { contentId } = request.params;
        await deleteContentServices(contentId);

        return {
          status: 'success',
          result: true,
        };
      } catch (error) {
        console.error(`Error code: ${error.code}, Error message: ${error.message}`);
        return {
          status: 'error',
          result: false,
          errorDetails: {
            code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
            message: error.message,
          },
        };
      }
    };
  }