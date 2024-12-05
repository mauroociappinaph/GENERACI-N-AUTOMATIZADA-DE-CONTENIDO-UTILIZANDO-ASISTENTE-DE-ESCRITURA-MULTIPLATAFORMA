/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */

import {
    findInTableData
  } from '../database/findInTable';
  
  
  export async function findInTableService(table, key, value, page) {
    try {
      const result = await findInTableData(table, key, value, page);
      return result;
    } catch (error) {
      throw error;
    }
  }