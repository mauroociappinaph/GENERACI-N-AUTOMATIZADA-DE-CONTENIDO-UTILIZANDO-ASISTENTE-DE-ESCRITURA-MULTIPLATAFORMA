import {
    createUserServices,
    deleteUserServices,
    getAllUsersServices,
    getUserByIdServices,
    updateUserServices,
  } from './usersServices';

  export function getAllUsersControllers(Parse) {
    return async (request) => {
      try {
        const { page } = request.params;
        const users = await getAllUsersServices(page);

        return users;
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

  export function getUserByIdControllers(Parse) {
    return async (request) => {
      try {
        const { userId } = request.params;
        const user = await getUserByIdServices(userId);

        return {
          status: 'success',
          result: true,
          user,
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

  export function createUserControllers(Parse) {
    return async (request) => {
      try {
        const { objectData } = request.params;
        const user = await createUserServices(objectData);

        return {
          status: 'success',
          result: true,
          user,
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

  export function updateUserControllers(Parse) {
    return async (request) => {
      try {
        const { userId, objectData } = request.params;
        const user = await updateUserServices(userId, objectData);

        return {
          status: 'success',
          result: true,
          user,
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

  export function deleteUserControllers(Parse) {
    return async (request) => {
      try {
        const { userId } = request.params;
        await deleteUserServices(userId);

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