/* eslint-disable no-console */

export async function assignRoleToUser(user, roleName) {
    const query = new Parse.Query(Parse.Role);
    query.equalTo('name', roleName);
    const role = await query.first();
  
    if (!role) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Role ${roleName} not found.`);
    }
  
    const relation = role.relation('users');
    //Agregar el usuario a la relacion
    relation.add(user);
    await role.save(null, { useMasterKey: true });
  }