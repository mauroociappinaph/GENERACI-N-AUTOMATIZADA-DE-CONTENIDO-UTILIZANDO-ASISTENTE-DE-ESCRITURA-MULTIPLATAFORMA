import request from 'supertest';
import config from '../../../../src/config';
import { loginUser } from '../../../../src/utils/clouds/loginUser';
import { app, httpServer } from '../../../../src/index';

const masterKey = config.MASTER_KEY;
const applicationId = config.APPLICATION_ID;
describe('Users tests', () => {
  let sessionToken;
  let createUserResponse;

  beforeAll(async () => {
    sessionToken = await loginUser();

    createUserResponse = await request(app)
      .post('/server/functions/createUser')
      .set('X-Parse-Application-Id', applicationId)
      .set('X-Parse-REST-API-Key', masterKey)
      .send({
        objectData: {
          userName: 'user',
          userEmail: 'correo',
          userPassword: 'contraseña',
          userType: 'tipo de usuario',
          userPhone: 'nro telefonico',
          userEmailVerified: 'verificacion de email',
          userInterests: 'intereses',
          userSocialNetworks: 'redes sociales',
          userDemographics: {
            fullName: 'nombre completo',
            birthDate: 'fecha de nacimiento',
            dni: 'documento de identidad',
            gender: 'genero',
            address: 'direccion',
            country: 'pais',
          },
        },
      });
  });

  describe('Create User', () => {
    it('The response status is "success"', async () => {
      expect(createUserResponse.body.result.status).toBe('success');
    });

    it('The request should bring a User object', async () => {
      expect(createUserResponse.body.result).toHaveProperty('user');
    });

    it('The response contains a result object', async () => {
      expect(createUserResponse.body.result.result).toBe(true);
    });
  });

  describe('Update User', () => {
    let updateUserResponse;
    beforeAll(async () => {
      updateUserResponse = await request(app)
        .post('/server/functions/updateUser')
        .set('X-Parse-Application-Id', applicationId)
        .set('X-Parse-REST-API-Key', masterKey)
        .set('X-Parse-Session-Token', sessionToken)
        .send({
          userId: createUserResponse.body.result.user.objectId,
          objectData: {
            userName: 'user',
          },
        });
    });

    it('The response status is "success"', async () => {
      expect(updateUserResponse.body.result.status).toBe('success');
    });

    it('The response should contain a User object', async () => {
      expect(updateUserResponse.body.result).toHaveProperty('user');
    });

    it('The response contains a result object', async () => {
      expect(updateUserResponse.body.result.result).toBe(true);
    });
  });

  describe('getAllUsers', () => {
    let getAllUsersResponse;
    beforeAll(async () => {
      getAllUsersResponse = await request(app)
        .post('/server/functions/getAllUsers')
        .set('X-Parse-Application-Id', applicationId)
        .set('X-Parse-REST-API-Key', masterKey)
        .set('X-Parse-Session-Token', sessionToken)
        .send({
          page: 1,
        });
    });

    it('should have a response status of "success"', async () => {
      expect(getAllUsersResponse.body.result.status).toBe('success');
    });

    it('should return an array of Users', async () => {
      expect(getAllUsersResponse.body.result).toHaveProperty('users');
    });

    it('the response from getAllUsers should contain an array of Users', async () => {
      expect(Array.isArray(getAllUsersResponse.body.result.users)).toBe(true);
    });
  });

  describe('getUserById', () => {
    let getUserResponse;
    beforeAll(async () => {
      getUserResponse = await request(app)
        .post('/server/functions/getUserById')
        .set('X-Parse-Application-Id', applicationId)
        .set('X-Parse-REST-API-Key', masterKey)
        .set('X-Parse-Session-Token', sessionToken)
        .query({
          userId: createUserResponse.body.result.user.objectId,
        });
    });

    it('should have a response status of "success"', async () => {
      expect(getUserResponse.body.result.status).toBe('success');
    });

    it('should return a User object', async () => {
      expect(getUserResponse.body.result).toHaveProperty('user');
    });

    it('the response contains a User object', async () => {
      expect(getUserResponse.body.result.user).toBeInstanceOf(Object);
    });
  });

  describe('Delete User', () => {
    let deleteUserResponse;
    beforeAll(async () => {
      deleteUserResponse = await request(app)
        .post('/server/functions/deleteUser')
        .set('X-Parse-Application-Id', applicationId)
        .set('X-Parse-REST-API-Key', masterKey)
        .set('X-Parse-Session-Token', sessionToken)
        .send({
          userId: createUserResponse.body.result.user.objectId,
        });
    });

    it('The response status is "success"', async () => {
      expect(deleteUserResponse.body.result.status).toBe('success');
    });

    it('The response contains a result object', async () => {
      expect(deleteUserResponse.body.result.result).toBe(true);
    });
  });

  afterAll(() => {
    httpServer.close();
  });
});
