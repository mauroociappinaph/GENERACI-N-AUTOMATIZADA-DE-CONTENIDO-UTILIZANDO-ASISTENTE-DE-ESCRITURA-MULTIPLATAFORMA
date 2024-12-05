export async function getAllContentsServices(page) {
    try {
      let pageSize = 5;

      // Verificar si la página es nula o indefinida
      if (page === null || page === undefined) {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Page number is missing.');
      }

      const Contents = Parse.Object.extend('contents');
      const query = new Parse.Query(Contents);
      
      // Obtiene el total de registros
      const totalContents = await query.count({ useMasterKey: true });

      // Configurar paginación
      const totalPages = Math.ceil(totalContents / pageSize);

      query.limit(pageSize); // Limita los resultados a 5 por página
      query.skip((page - 1) * pageSize); // Salta los resultados de las páginas anteriores

      const contents = await query.find({ useMasterKey: true });

      if (!contents || contents.length === 0) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `No contents found.`);
      }


      const result = {
        status: 'success',
        result: true,
        totalPages,
        contents,
      };
      return result;
    } catch (error) {
      throw error;
    }
  }
    
  export async function getContentByIdServices(contentId) {
    try {
      // Verificar si contentId es nulo o indefinido
      if (!contentId) {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Content ID is missing.');
      }

      const Contents = Parse.Object.extend('contents');
      const query = new Parse.Query(Contents);
      query.equalTo('objectId', contentId);
      const content = await query.first();

      if (!content) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Content with ID ${contentId} does not exist.`);
      }

      return content;
    } catch (error) {
      throw error;
    }
  }

  export async function createContentServices(objectData) {
    try {
      // Verificar si objectData existe
      if (!objectData) {
        throw {
          code: Parse.Error.OBJECT_NOT_FOUND,
          message: 'objectData is missing.',
        };
      }

      const Contents = Parse.Object.extend('contents');
      const content = new Contents(objectData);

      

      await content.save(null, { useMasterKey: true });
      return content;
    } catch (error) {
      throw {
        code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  export async function updateContentServices(contentId, objectData) {
    try {
      // Verificar si contentId y objectData existen
      if (!contentId || !objectData) {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Content ID or objectData is missing.');
      }

      const Contents = Parse.Object.extend('contents');
      const query = new Parse.Query(Contents);
      query.equalTo('objectId', contentId);
      const content = await query.first();

      if (!content) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Content with ID ${contentId} does not exist.`);
      }

      // Actualizar los campos permitidos
      for (const key in objectData) {
        content.set(key, objectData[key]);
      }
      await content.save(null, { useMasterKey: true });

      return content;
    } catch (error) {
      throw error;
    }
  }

  export async function deleteContentServices(contentId) {
    try {
      // Verificar si contentId es nulo o indefinido
      if (!contentId) {
        throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Content ID is missing.');
      }

      const Contents = Parse.Object.extend('contents');
      const query = new Parse.Query(Contents);
      query.equalTo('objectId', contentId);
      const content = await query.first({ useMasterKey: true });

      if (!content) {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Content with ID ${contentId} does not exist.`);
      }

      await content.destroy({ useMasterKey: true });
    } catch (error) {
      throw error;
    }
  }