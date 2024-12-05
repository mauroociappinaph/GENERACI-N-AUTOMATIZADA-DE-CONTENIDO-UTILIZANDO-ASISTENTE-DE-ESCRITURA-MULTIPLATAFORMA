import request from 'supertest';
  import config from '../../../../src/config';
  import { loginUser } from '../../../../src/utils/clouds/loginUser';
  import { app, httpServer } from '../../../../src/index';

  const masterKey = config.MASTER_KEY
  const applicationId = config.APPLICATION_ID
  describe('Contents tests', () => {
    let sessionToken;
    let createContentResponse

    beforeAll(async () => {

      sessionToken = await loginUser();

      createContentResponse = await request(app)
        .post('/server/functions/createContent')
        .set('X-Parse-Application-Id', applicationId)
        .set('X-Parse-REST-API-Key', masterKey)
        .send({
          objectData: {}
        });
    });

    describe('Create Content', () => {
      it('The response status is "success"', async () => {
        expect(createContentResponse.body.result.status).toBe('success');
      });

      it('The request should bring a Content object', async () => {
        expect(createContentResponse.body.result).toHaveProperty('content');
      });

      it('The response contains a result object', async () => {
        expect(createContentResponse.body.result.result).toBe(true);
      });

    });

    describe('Update Content', () => {
      let updateContentResponse;
      beforeAll(async () => {
        updateContentResponse = await request(app)
          .post('/server/functions/updateContent')
          .set('X-Parse-Application-Id', applicationId)
          .set('X-Parse-REST-API-Key', masterKey)
          .set('X-Parse-Session-Token', sessionToken)
          .send({
            contentId: createContentResponse.body.result.content.objectId,
            objectData: {
              undefined: undefined
            },
          });
      });

      it('The response status is "success"', async () => {
        expect(updateContentResponse.body.result.status).toBe('success');
      });

      it('The response should contain a Content object', async () => {
        expect(updateContentResponse.body.result).toHaveProperty('content');
      });

      it('The response contains a result object', async () => {
        expect(updateContentResponse.body.result.result).toBe(true);
      });
    });

    describe('getAllContents', () => {
      let getAllContentsResponse;
      beforeAll(async () => {
        getAllContentsResponse = await request(app)
          .post('/server/functions/getAllContents')
          .set('X-Parse-Application-Id', applicationId)
          .set('X-Parse-REST-API-Key', masterKey)
          .set('X-Parse-Session-Token', sessionToken)
          .send({
            page: 1,
          });
      });

      it('should have a response status of "success"', async () => {
        expect(getAllContentsResponse.body.result.status).toBe('success');
      });

      it('should return an array of Contents', async () => {
        expect(getAllContentsResponse.body.result).toHaveProperty('contents');
      });

      it('the response from getAllContents should contain an array of Contents', async () => {
        expect(Array.isArray(getAllContentsResponse.body.result.contents)).toBe(true);
      });
    });

    describe('getContentById', () => {
      let getContentResponse;
      beforeAll(async () => {
        getContentResponse = await request(app)
          .post('/server/functions/getContentById')
          .set('X-Parse-Application-Id', applicationId)
          .set('X-Parse-REST-API-Key', masterKey)
          .set('X-Parse-Session-Token', sessionToken)
          .query({
            contentId: createContentResponse.body.result.content.objectId,
          });
      });

      it('should have a response status of "success"', async () => {
        expect(getContentResponse.body.result.status).toBe('success');
      });

      it('should return a Content object', async () => {
        expect(getContentResponse.body.result).toHaveProperty('content');
      });

      it('the response contains a Content object', async () => {
        expect(getContentResponse.body.result.content).toBeInstanceOf(Object);
      });
    });

    describe('Delete Content', () => {
      let deleteContentResponse;
      beforeAll(async () => {
        deleteContentResponse = await request(app)
          .post('/server/functions/deleteContent')
          .set('X-Parse-Application-Id', applicationId)
          .set('X-Parse-REST-API-Key', masterKey)
          .set('X-Parse-Session-Token', sessionToken)
          .send({
            contentId: createContentResponse.body.result.content.objectId,
          });
      });

      it('The response status is "success"', async () => {
        expect(deleteContentResponse.body.result.status).toBe('success');
      });

      it('The response contains a result object', async () => {
        expect(deleteContentResponse.body.result.result).toBe(true);
      });
    });

    afterAll(() => {
      httpServer.close();
    });
  });