/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDataService } from '../services/seederServices';

/* eslint-disable no-console */
export function createDataController(Parse) {
  return async (request) => {
    try {
      const { data } = request.params;
      const sessionToken = request.headers.authorization;

      //console.log('******************sessionToken', sessionToken)
      //console.log('******************data', data);
      await createDataService(data, sessionToken);

      return {
        status: 'success',
        result: true,
        msg: 'Data created successfully',
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
