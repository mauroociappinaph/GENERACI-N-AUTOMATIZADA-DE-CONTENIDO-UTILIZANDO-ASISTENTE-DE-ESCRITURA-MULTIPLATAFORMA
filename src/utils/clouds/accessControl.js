/* eslint-disable etc/no-commented-out-code */
/* eslint-disable no-console */

export async function checkUserRole(sessionToken, allowedRoles) {
  try {
    // Obtener la sesión del usuario autenticado
    const sessionQuery = new Parse.Query(Parse.Session);
    sessionQuery.equalTo('sessionToken', sessionToken);
    const session = await sessionQuery.first({ useMasterKey: true });

    if (!session) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token.');
    }

    // Obtener el usuario autenticado a partir de la sesión
    const user = session.get('user');

    // Verificar el rol del usuario
    const query = new Parse.Query(Parse.Role);
    query.equalTo('users', user);
    const roles = await query.find();
    const userRoles = roles.map((role) => role.getName());

    return userRoles.some((role) => allowedRoles.includes(role));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}
