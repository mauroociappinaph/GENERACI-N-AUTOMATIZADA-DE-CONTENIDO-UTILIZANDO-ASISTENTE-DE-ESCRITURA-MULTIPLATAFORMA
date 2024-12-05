/* eslint-disable complexity */
/* eslint-disable guard-for-in */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inline-comments */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-throw-literal */

export async function findInTableData(table, key, value, page) {
    try {
      // Verificar si inventoryId es nulo o indefinido
      if (!value || !key || !value || !page) {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Fields are missing.');
      }
  
      const Table = Parse.Object.extend(table);
      const query = new Parse.Query(Table);

      query.limit(5); // Limita los resultados a 5 por página
      query.skip((page - 1) * 5);

      query.equalTo(key, value);
      const result = await query.find();
  
      if (!result) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `No results found.`);
      } else if (result.length === 0) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `No results found on this page.`);
      }

  
      return result;
    } catch (error) {
      throw error;
    }
  }