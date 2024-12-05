/* eslint-disable no-console */
/* eslint-disable etc/no-commented-out-code */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  registerTableFromJSONData,
  deleteTableFromJSONData,
  getAllTableFromJSONData,
  getTableFromJSONByIdData,
  updateTableFromJSONData,
} from '../database/tableFromJSON';

import { checkUserRole } from '../../../src/utils/clouds/accessControl';

export async function getAllTableFromJSONService(page, tableName, sessionToken) {
  try {
    const permission = await checkUserRole(sessionToken, ['superuser', 'admin', 'ia']);

    if (!permission) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, `User does not have permission to delete users.`);
    }

    const tables = await getAllTableFromJSONData(page, tableName);
    return tables;
  } catch (error) {
    throw error;
  }
}

export async function getTableFromJSONByIdService(tableFromJSONId, tableName, sessionToken) {
  try {
    const permission = await checkUserRole(sessionToken, ['superuser', 'admin', 'ia']);

    if (!permission) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, `User does not have permission to delete users.`);
    }

    const table = await getTableFromJSONByIdData(tableFromJSONId, tableName);
    return table;
  } catch (error) {
    throw error;
  }
}

export async function registerTableFromJSONService(tablename, data, sessionToken) {
  try {
    const permission = await checkUserRole(sessionToken, ['superuser', 'admin', 'ia']);

    if (!permission) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, `User does not have permission to delete users.`);
    }

    const table = await registerTableFromJSONData(tablename, data);

    return table;
  } catch (error) {
    throw error;
  }
}

export async function updateTableFromJSONService(tableFromJSONId, data, tableName, sessionToken) {
  try {
    const permission = await checkUserRole(sessionToken, ['superuser', 'admin', 'ia']);

    if (!permission) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, `User does not have permission to delete users.`);
    }

    const table = await updateTableFromJSONData(tableFromJSONId, data, tableName);
    return table;
  } catch (error) {
    throw error;
  }
}

export async function deleteTableFromJSONService(tableFromJSONId, tableName, sessionToken) {
  try {
    const permission = await checkUserRole(sessionToken, ['superuser', 'admin', 'ia']);

    if (!permission) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, `User does not have permission to delete users.`);
    }

    await deleteTableFromJSONData(tableFromJSONId, tableName);
  } catch (error) {
    throw error;
  }
}
