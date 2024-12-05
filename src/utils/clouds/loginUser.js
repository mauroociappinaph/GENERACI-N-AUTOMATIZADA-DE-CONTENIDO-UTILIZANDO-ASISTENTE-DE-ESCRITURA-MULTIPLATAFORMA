import request from 'supertest';
import config from '../../config';
import { app } from "../../index";
// import { app } from '../../../../src';
const masterKey = config.MASTER_KEY
const applicationId = config.APPLICATION_ID

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function loginUser() {
  try {
    // Wait for 15 seconds (15000 milliseconds)
    await delay(15000);

    const loginResponse = await request(app)
      .post('/server/login')
      .set('X-Parse-Application-Id', `${applicationId}`)
      .set('X-Parse-REST-API-Key', masterKey)
      .send({
        username: 'gustavohernandez',
        password: 'DAzu.0429',
      });

    const { sessionToken } = loginResponse.body;
    return sessionToken;
  } catch (error) {
    console.error("Error during loginUser:", error);
    throw error;
  }
}