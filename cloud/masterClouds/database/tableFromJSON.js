/* eslint-disable no-console */
/* eslint-disable guard-for-in */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inline-comments */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-throw-literal */

export async function getAllTableFromJSONData(page, tableName) {
  try {
    // Verificar si la página es nula o indefinida
    if (page === null || page === undefined) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Page number is missing.');
    }

    const Table = Parse.Object.extend(tableName);
    const query = new Parse.Query(Table);
    query.limit(5); // Limita los resultados a 5 por página
    query.skip((page - 1) * 5); // Salta las tablas de las páginas anteriores
    const tables = await query.find();

    if (!tables || tables.length === 0) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `No ${tableName} found.`);
    }

    return tables;
  } catch (error) {
    throw error;
  }
}

export async function getTableFromJSONByIdData(tableFromJSONId, tableName) {
  try {
    // Verificar si tableFromJSONId es nulo o indefinido
    if (!tableFromJSONId) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Table ID is missing.');
    }

    const Table = Parse.Object.extend(tableName);
    const query = new Parse.Query(Table);
    query.equalTo('objectId', tableFromJSONId);
    const table = await query.first();

    if (!table) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Table with ID ${tableFromJSONId} does not exist.`);
    }

    return table;
  } catch (error) {
    throw error;
  }
}

export async function registerTableFromJSONData(tablename, data) {
  try {
    // Verificar si data existe
    if (!data) {
      throw {
        code: Parse.Error.OBJECT_NOT_FOUND,
        message: 'Data is missing.',
      };
    }

    const Table = Parse.Object.extend(tablename);
    const table = new Table();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        table.set(key, data[key]);
      }
    }

    await table.save();
    return table;
  } catch (error) {
    throw {
      code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
      message: error.message,
    };
  }
}

export async function updateTableFromJSONData(tableFromJSONId, data, tableName) {
  try {
    // Verificar si tableFromJSONId y data existen
    if (!tableFromJSONId || !data) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Table ID or data is missing.');
    }

    const Table = Parse.Object.extend(tableName);
    const query = new Parse.Query(Table);
    query.equalTo('objectId', tableFromJSONId);
    const table = await query.first();

    if (!table) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Table with ID ${tableFromJSONId} does not exist.`);
    }

    // Actualizar los campos permitidos
    for (const key in data) {
      table.set(key, data[key]);
    }
    await table.save(null, { useMasterKey: true });

    return table;
  } catch (error) {
    throw error;
  }
}

export async function deleteTableFromJSONData(tableFromJSONId, tableName) {
  try {
    // Verificar si tableFromJSONId es nulo o indefinido
    if (!tableFromJSONId) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Table ID is missing.');
    }

    const Table = Parse.Object.extend(tableName);
    const query = new Parse.Query(Table);
    query.equalTo('objectId', tableFromJSONId);
    const table = await query.first();

    if (!table) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Table with ID ${tableFromJSONId} does not exist.`);
    }

    await table.destroy();
  } catch (error) {
    throw error;
  }
}
