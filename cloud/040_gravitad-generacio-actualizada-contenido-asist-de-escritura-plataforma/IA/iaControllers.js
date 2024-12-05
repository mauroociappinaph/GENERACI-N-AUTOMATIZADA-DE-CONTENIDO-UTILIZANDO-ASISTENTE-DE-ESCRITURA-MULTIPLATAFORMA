import { sendToIaEndpoint } from './sendToIaEndpoint';

export const getIARecomendation = (Parse) => {
  return async (request) => {
    try {
      const { objectData } = request.params;

      if (!objectData) {
        throw {
          code: Parse.Error.OBJECT_NOT_FOUND,
          message: 'objectData is missing',
        };
      }

      const data = await sendToIaEndpoint(objectData, Parse);

      return {
        status: 'success',
        result: true,
        data,
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
};
