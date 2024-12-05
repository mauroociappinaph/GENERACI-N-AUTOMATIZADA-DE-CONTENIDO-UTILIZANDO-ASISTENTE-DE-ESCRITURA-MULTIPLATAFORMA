/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { loadAllData } from '../helpers/loadAllData';

export default function seedersMain(Parse) {
  return async (request) => {
    try {
      await loadAllData();

      return {
        status: 'success',
        result: true,
        message: 'Seeding successfully completed.',
      };
    } catch (error) {
      console.error(`Código de error: ${error.code}, Mensaje de error: ${error.message}`);
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
