// @ts-ignore
import { ParseServer } from 'parse-server';
import config from './config';
import MoralisAuthAdapter from './auth/MoralisAuthAdapter';
// import { User } from '../schemas/schema';

//import sendGridAdapter from 'parse-server-sendgrid-email-adapter';
//* import { email } from 'envalid';

const dataBaseUri = config.DEVELOPMENT_MODE === 'prod' ? config.DATABASE_URI_PROD : config.DATABASE_URI_DEV;

const serverPublicUrl =
  config.DEVELOPMENT_MODE === 'prod' ? config.SERVER_PUBLIC_URL_PROD : config.SERVER_PUBLIC_URL_DEV;

export const parseServer = new ParseServer({
  liveQuery: {
    classNames: ['ItemsMinted', 'CollectionsPolygon'],
  },
  websocketTimeout: 60 * 1000,

  databaseURI: dataBaseUri,
  cloud: config.CLOUD_PATH,
  serverURL: config.SERVER_URL,
  encodeParseObjectInCloudFunction: false,
  logsFolder: './logs',
  publicServerURL: serverPublicUrl,
  appName: config.APP_NAME,
  appId: config.APPLICATION_ID,
  masterKey: config.MASTER_KEY,
  //masterKeyIps: config.MASTER_KEY_IPS,
  masterKeyIps: ['::1', '127.0.0.1', '192.168.50.164', '192.168.50.229'],
  allowClientClassCreation: true,
  auth: {
    moralis: {
      module: MoralisAuthAdapter,
    },
  },
  // Define schemas of Parse Server
  // schema: {
  //   definitions: [User], //? aqui van las tablas a generar con su seguridad
  //   // If set to true, the Parse Server API for schema changes is disabled and schema
  //   // changes are only possible by redeployingParse Server with a new schema definition
  //   lockSchemas: true,
  //   // If set to true, Parse Server will automatically delete non-defined classes from
  //   // the database; internal classes like User or Role are never deleted.
  //   strict: true,
  //   // If set to true, a field type change will cause the field including its data to be
  //   // deleted from the database, and then a new field to be created with the new type
  //   recreateModifiedFields: false,
  //   // If set to true, Parse Server will automatically delete non-defined class fields;
  //   // internal fields in classes like User or Role are never deleted.
  //   deleteExtraFields: true,
  // },
  verifyUserEmails: false,
  emailVerifyTokenValidityDuration: 2 * 60 * 60,
  /* emailAdapter: sendGridAdapter({
    apiKey: config.SENDGRID_MAIL_API_KEY,
    from: config.SENDGRID_MAIL_SENDER,
    passwordResetEmailTemplate: config.SENDGRID_PASS_RESET_EMAIL_TEMPLATE,
    verificationEmailTemplate: config.SENDGRID_VERIFY_EMAIL_TEMPLATE,
  }), */
});

(() => {
  parseServer.start();
})();
