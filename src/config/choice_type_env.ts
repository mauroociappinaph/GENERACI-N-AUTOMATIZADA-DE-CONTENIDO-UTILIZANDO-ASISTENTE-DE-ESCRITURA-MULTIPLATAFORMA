import config from '../config';

const appId = config.APPLICATION_ID;
const appName = config.APP_NAME;
const masterKey = config.MASTER_KEY;
const port = config.HTTP_PORT;
const useStream = config.USE_STREAMS;
const streamWebHookURL = config.STREAMS_WEBHOOK_URL;
const serverEndPonint = config.SERVER_ENDPOINT;


const allowInsecureHttp = config.ALLOW_INSECURE_HTTP;

const cloudPath = config.CLOUD_PATH;
const serverURL = config.SERVER_URL;
const serverPublicUrl = config.DEVELOPMENT_MODE === 'prod' ? config.SERVER_PUBLIC_URL_PROD : config.SERVER_PUBLIC_URL_DEV;

const dataBaseUri = config.DEVELOPMENT_MODE === 'prod' ? config.DATABASE_URI_PROD : config.DATABASE_URI_DEV;

const moralisApiKey = config.DEVELOPMENT_MODE === 'prod' ? config.MORALIS_API_KEY_PROD : config.MORALIS_API_KEY_DEV;
const moralisApiKeyStreams = config.DEVELOPMENT_MODE === 'prod' ? config.MORALIS_API_KEY_STREAMS_PROD : config.MORALIS_API_KEY_STREAMS_DEV;

const sendGridMailApiKey = config.SENDGRID_MAIL_API_KEY;
const sendGridMailSender = config.SENDGRID_MAIL_SENDER;
const sendGridPassResetEmailTemplate = config.SENDGRID_PASS_RESET_EMAIL_TEMPLATE;
const sendGridVerifyEmailTemplate = config.SENDGRID_VERIFY_EMAIL_TEMPLATE;

const { USER_DASHBOARD1,
        USER_PASS_DASHBOARD1,
        USER_DASHBOARD2,
        USER_PASS_DASHBOARD2,
        USER_DASHBOARD3,
        USER_PASS_DASHBOARD3
      } = config;


const serverData: {
  appName: string;
  dataBaseUri: string;
  cloudPath: string;
  appId: string;
  masterKey: string;
  serverURL: string;
  serverPublicUrl: string;
  allowInsecureHttp: boolean;
  port: number;
  useStream: boolean;
  serverEndPonint: string;
  streamWebHookURL: string;
} = {
  appName,
  dataBaseUri,
  cloudPath,
  appId,
  masterKey,
  serverURL,
  serverPublicUrl,
  allowInsecureHttp,
  useStream,
  serverEndPonint,
  streamWebHookURL,
  port
};

const apiData: {
  moralisApiKey: string;
  moralisApiKeyStreams: string;
  sendGridMailApiKey: string;
  sendGridMailSender: string;
  sendGridPassResetEmailTemplate: string;
  sendGridVerifyEmailTemplate: string;
} = {
  moralisApiKey,
  moralisApiKeyStreams,
  sendGridMailApiKey,
  sendGridMailSender,
  sendGridPassResetEmailTemplate,
  sendGridVerifyEmailTemplate
};

const dashboardData: {
  userDash1: string;
  passDash1: string;
  userDash2: string;
  passDash2: string;
  userDash3: string;
  passDash3: string;
} = {
  userDash1: USER_DASHBOARD1,
  passDash1: USER_PASS_DASHBOARD1,
  userDash2: USER_DASHBOARD2,
  passDash2: USER_PASS_DASHBOARD2,
  userDash3: USER_DASHBOARD3,
  passDash3: USER_PASS_DASHBOARD3
}

export {
  serverData,
  apiData,
  dashboardData
};
