/* eslint-disable no-promise-executor-return */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */

let isCalled = false;

const username = 'zuccadev'
const password = 'DAzu.0429'
const email = 'zuccadev@gmail.com'

const usernameIA = 'augustbenito'
const passwordIA = 'DAzu.0429'
const emailIA = 'augustbenitogroup@gmail.com'


const usernameAdmin1 = 'carucib'
const passwordAdmin1 = 'DAzu.0429'
const emailAdmin1 = 'carucib@gmail.com'

const usernameAdmin2 = 'gustavohernandez'
const passwordAdmin2 = 'DAzu.0429'
const emailAdmin2 = 'hernandez29a@gmail.com'

const usernameAdmin3 = 'golfredopf'
const passwordAdmin3 = 'DAzu.0429'
const emailAdmin3 = 'golfredo.pf@gmail.com'

const usernameAdmin4 = 'franciscoaugust'
const passwordAdmin4 = 'DAzu.0429'
const emailAdmin4 = 'franciscoaugustfa@gmail.com'

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const createRoleHierarchy = async () => {

  const usersToAddToAdminRole = [];

  try{
      
    if (isCalled) {
      throw 'Esta función ya ha sido invocada';
    }

    isCalled = true;
    const vale = true;


    const user = new Parse.User();
    user.set('username', username);
    user.set('password', password);
    user.set('email', email);
    await user.signUp();
    
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(user, true);
    const superUserRole = new Parse.Role('superuser', acl);
    superUserRole.getUsers().add(user);
    await superUserRole.save(null, { useMasterKey: true });
  

    const superUserQuery = new Parse.Query(Parse.User);
    superUserQuery.equalTo('username', username);
    const superUser = await superUserQuery.first({ useMasterKey: true });
    
    if (!superUser) {
      throw 'No se encontró el superusuario';
    }
    
    const adminRoleQuery = new Parse.Query(Parse.Role);
    adminRoleQuery.equalTo('name', 'admin');
    let adminRole: any = await adminRoleQuery.first({ useMasterKey: true });

    if (!adminRole) {
      const acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(superUser, true);
      adminRole = new Parse.Role('admin', acl);
      await adminRole.save(null, { useMasterKey: true });
      await sleep(2000);
    }

    const userRoleQuery = new Parse.Query(Parse.Role);
    userRoleQuery.equalTo('name', 'user');
    let userRole = await userRoleQuery.first({ useMasterKey: true });

    if (!userRole) {
      const acl = new Parse.ACL();
      const adminUsers = await adminRole.getUsers().query().find({ useMasterKey: true });
      for (const adminUser of adminUsers) {
        acl.setWriteAccess(adminUser, true);
      }
      acl.setPublicReadAccess(true);
      userRole = new Parse.Role('user', acl);
      await userRole.save(null, { useMasterKey: true });
      await sleep(2000);
    }

    const iaRoleQuery = new Parse.Query(Parse.Role);
    iaRoleQuery.equalTo('name', 'ia');
    let iaRole = await iaRoleQuery.first({ useMasterKey: true });

    if (!iaRole) {
      const acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(superUser, true);
      acl.setWriteAccess(adminRole, true);
      iaRole = new Parse.Role('ia', acl);
      await iaRole.save(null, { useMasterKey: true });
      await sleep(2000);
    }

    const userIAQuery = new Parse.Query(Parse.User);
    userIAQuery.equalTo('username', usernameIA);
    let userIA = await userIAQuery.first({ useMasterKey: true });

    if (!userIA) {
      userIA = new Parse.User();
      userIA.set('username', usernameIA);
      userIA.set('password', passwordIA);
      userIA.set('email', emailIA);
      await userIA.signUp();
      await sleep(2000);
    }

    iaRole.getUsers().add(userIA);
    await iaRole.save(null, { useMasterKey: true });

    // Crear y asignar rol a usuario Admin1
    const userAdmin1Query = new Parse.Query(Parse.User);
    userAdmin1Query.equalTo('username', usernameAdmin1);
    let userAdmin1 = await userAdmin1Query.first({ useMasterKey: true });

    if (!userAdmin1) {
      userAdmin1 = new Parse.User();
      userAdmin1.set('username', usernameAdmin1);
      userAdmin1.set('password', passwordAdmin1);
      userAdmin1.set('email', emailAdmin1);
      await userAdmin1.signUp();
      usersToAddToAdminRole.push(userAdmin1);
      await sleep(2000);
    }

    const userAdmin2Query = new Parse.Query(Parse.User);
    userAdmin2Query.equalTo('username', usernameAdmin2);
    let userAdmin2 = await userAdmin2Query.first({ useMasterKey: true });

    if (!userAdmin2) {
      userAdmin2 = new Parse.User();
      userAdmin2.set('username', usernameAdmin2);
      userAdmin2.set('password', passwordAdmin2);
      userAdmin2.set('email', emailAdmin2);
      await userAdmin2.signUp();
      usersToAddToAdminRole.push(userAdmin2);
      await sleep(2000);
    }

    const userAdmin3Query = new Parse.Query(Parse.User);
    userAdmin3Query.equalTo('username', usernameAdmin3);
    let userAdmin3 = await userAdmin3Query.first({ useMasterKey: true });

    if (!userAdmin3) {
      userAdmin3 = new Parse.User();
      userAdmin3.set('username', usernameAdmin3);
      userAdmin3.set('password', passwordAdmin3);
      userAdmin3.set('email', emailAdmin3);
      await userAdmin3.signUp();
      usersToAddToAdminRole.push(userAdmin3);
      await sleep(2000);
    }

    const userAdmin4Query = new Parse.Query(Parse.User);
    userAdmin4Query.equalTo('username', usernameAdmin4);
    let userAdmin4 = await userAdmin4Query.first({ useMasterKey: true });

    if (!userAdmin4) {
      userAdmin4 = new Parse.User();
      userAdmin4.set('username', usernameAdmin4);
      userAdmin4.set('password', passwordAdmin4);
      userAdmin4.set('email', emailAdmin4);
      await userAdmin4.signUp();
      usersToAddToAdminRole.push(userAdmin4);
      await sleep(2000);
    }

    adminRole.getUsers().add(usersToAddToAdminRole);
    await adminRole.save(null, { useMasterKey: true });

  }catch(error){
    console.log(error)
  }
};

export default createRoleHierarchy;