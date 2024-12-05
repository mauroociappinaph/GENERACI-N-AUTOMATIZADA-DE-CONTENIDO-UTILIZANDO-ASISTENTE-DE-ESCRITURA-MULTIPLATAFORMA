/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
export async function requireAuthentication(request) {
    console.log('*************', request);
  
    if (!request.user) {
      throw new Parse.Error(Parse.Error.SESSION_MISSING, 'Debe estar autenticado para realizar esta operación');
    }
  }