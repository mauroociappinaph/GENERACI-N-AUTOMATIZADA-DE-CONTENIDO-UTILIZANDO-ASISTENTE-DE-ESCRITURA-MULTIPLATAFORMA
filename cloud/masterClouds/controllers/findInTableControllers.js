/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import {
    findInTableService
  } from '../services/findInTableServices';
  
  export function findInTable(Parse) {
    return async (request) => {
      try {
        const { table, key, value, page } = request.params;
        const data = await findInTableService(table, key, value, page);
  
        return {
          status: 'success',
          result: true,
          data,
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