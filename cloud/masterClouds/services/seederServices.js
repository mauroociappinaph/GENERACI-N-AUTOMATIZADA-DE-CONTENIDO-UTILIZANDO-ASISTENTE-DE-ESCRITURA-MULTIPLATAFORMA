/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
/* eslint-disable no-undef */
//*  import Parse from 'parse';
//*  import { Grant } from './Grant'; // Assuming you have a Grant interface/class

import { createData } from '../database/seeder';

import { checkUserRole } from '../../../src/utils/clouds/accessControl';

export async function createDataService(request, sessionToken) {
  try {
    const permission = await checkUserRole(sessionToken, ['superuser', 'admin', 'ia']);

    //console.log('******************permission', permission);
    if (!permission) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, `User does not have permission to delete users.`);
    }
    const data = await createData(request);
    return data;
  } catch (error) {
    throw error;
  }
}
