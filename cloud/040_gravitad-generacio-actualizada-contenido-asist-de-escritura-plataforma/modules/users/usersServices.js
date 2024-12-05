export async function getAllUsersServices(page) {
  try {
    let pageSize = 5;

    // Verificar si la página es nula o indefinida
    if (page === null || page === undefined) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Page number is missing.');
    }

    const Users = Parse.Object.extend('_User');
    const query = new Parse.Query(Users);

    // Obtiene el total de registros
    const totalUsers = await query.count({ useMasterKey: true });

    // Configurar paginación
    const totalPages = Math.ceil(totalUsers / pageSize);

    query.limit(pageSize); // Limita los resultados a 5 por página
    query.skip((page - 1) * pageSize); // Salta los resultados de las páginas anteriores

    const users = await query.find({ useMasterKey: true });

    if (!users || users.length === 0) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `No users found.`);
    }

    const result = {
      status: 'success',
      result: true,
      totalPages,
      users,
    };
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getUserByIdServices(userId) {
  try {
    // Verificar si userId es nulo o indefinido
    if (!userId) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User ID is missing.');
    }

    const Users = Parse.Object.extend('_User');
    const query = new Parse.Query(Users);
    query.equalTo('objectId', userId);
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `User with ID ${userId} does not exist.`);
    }

    return user;
  } catch (error) {
    throw error;
  }
}

export async function createUserServices(objectData) {
  try {
    // Verificar si objectData existe
    if (!objectData) {
      throw {
        code: Parse.Error.OBJECT_NOT_FOUND,
        message: 'objectData is missing.',
      };
    }

    const Users = Parse.Object.extend('_User');
    const user = new Users(objectData);

    await user.save(null, { useMasterKey: true });
    return user;
  } catch (error) {
    throw {
      code: error.code || Parse.Error.INTERNAL_SERVER_ERROR,
      message: error.message,
    };
  }
}

export async function updateUserServices(userId, objectData) {
  try {
    // Verificar si userId y objectData existen
    if (!userId || !objectData) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User ID or objectData is missing.');
    }

    const Users = Parse.Object.extend('_User');
    const query = new Parse.Query(Users);
    query.equalTo('objectId', userId);
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `User with ID ${userId} does not exist.`);
    }

    // Actualizar los campos permitidos
    for (const key in objectData) {
      user.set(key, objectData[key]);
    }
    await user.save(null, { useMasterKey: true });

    return user;
  } catch (error) {
    throw error;
  }
}

export async function deleteUserServices(userId) {
  try {
    // Verificar si userId es nulo o indefinido
    if (!userId) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User ID is missing.');
    }

    const Users = Parse.Object.extend('_User');
    const query = new Parse.Query(Users);
    query.equalTo('objectId', userId);
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `User with ID ${userId} does not exist.`);
    }

    await user.destroy({ useMasterKey: true });
  } catch (error) {
    throw error;
  }
}
