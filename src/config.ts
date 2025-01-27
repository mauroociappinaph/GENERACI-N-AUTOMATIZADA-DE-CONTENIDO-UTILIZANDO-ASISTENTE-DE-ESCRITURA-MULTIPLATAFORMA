// Este archivo es para que Typescript reconozca las ENV, de manera que haya variables de entoro por defecto para aquellas features que necesitan una, si se agrega una feature con su variable de entorno debe ser definida en este archivo, de lo contrario arrojará un error de tipado //

import * as dotenv from 'dotenv';
import { cleanEnv, num, str, bool, makeValidator } from 'envalid';

// Definir un validador personalizado para un arreglo de strings en el formato específico
const arrayValidator = makeValidator<string[]>((input) => {
  // Remover corchetes al principio y al final, y eliminar espacios alrededor
  const trimmedInput = input.trim().replace(/^\[|\]$/g, '');

  // Dividir por comas, luego limpiar cada elemento de comillas simples y espacios adicionales
  const array = trimmedInput.split(',').map((item) => item.trim().replace(/^'|'$/g, ''));

  // Verificar que el resultado es un array de strings
  if (!Array.isArray(array) || array.some((item) => typeof item !== 'string')) {
    throw new Error('Input must be an array of strings');
  }

  // Validar que cada elemento sea una IP válida (simplificado)
  if (
    array.some(
      (item) => !/^(\d{1,3}\.){3}\d{1,3}$/.test(item) && !/^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/.test(item),
    )
  ) {
    throw new Error('Invalid IP address format');
  }

  return array;
});

dotenv.config();

export default cleanEnv(process.env, {
  MORALIS_API_KEY: str({
    desc: 'Your moralis Api key (keep this secret)',
  }),

  SERVER_ENDPOINT: str({
    desc: 'Server endpoint',
    devDefault: 'server',
  }),
  ALLOW_INSECURE_HTTP: bool({ default: false }),
  DEVELOPMENT_MODE: str({
    desc: 'Set mode of development',
  }),
  MORALIS_API_KEY_PROD: str({
    desc: 'Your moralis Api key (keep this secret)',
  }),
  MORALIS_API_KEY_STREAMS_PROD: str({
    desc: 'Your moralis streams Api key (keep this secret)',
  }),
  DATABASE_URI_PROD: str({
    desc: 'URI to your MongoDB database',
    devDefault: 'mongodb://localhost:27017',
  }),
  REDIS_CONNECTION_STRING_PROD: str({
    desc: 'Connection string for your redis instance in the format of redis://<host>:<port> or redis://<username>:<password>@<host>:<port>',
    devDefault: 'redis://127.0.0.1:6379',
  }),
  SERVER_PUBLIC_URL_PROD: str({
    desc: 'Referenece to your server URL. Replace this when your app is hosted example: https://lionfish-app-awg72.ondigitalocean.app/server',
    devDefault: 'http://localhost:1337/server',
  }),

  MORALIS_API_KEY_DEV: str({
    desc: 'Your moralis Api key (keep this secret)',
  }),
  MORALIS_API_KEY_STREAMS_DEV: str({
    desc: 'Your moralis streams Api key (keep this secret)',
  }),
  DATABASE_URI_DEV: str({
    desc: 'URI to your MongoDB database',
    devDefault: 'mongodb://localhost:27017',
  }),
  REDIS_CONNECTION_STRING_DEV: str({
    desc: 'Connection string for your redis instance in the format of redis://<host>:<port> or redis://<username>:<password>@<host>:<port>',
    devDefault: 'redis://127.0.0.1:6379',
  }),
  SERVER_PUBLIC_URL_DEV: str({
    desc: 'Referenece to your server URL. Replace this when your app is hosted example: https://lionfish-app-awg72.ondigitalocean.app/server',
    devDefault: 'http://localhost:1337/server',
  }),

  SENDGRID_MAIL_API_KEY: str({
    desc: 'Your Sendgrid mail Api key (keep this secret)',
  }),
  SENDGRID_MAIL_SENDER: str({
    desc: 'Your mail for send email with api Sendgrid (keep this secret)',
  }),
  SENDGRID_VERIFY_EMAIL_TEMPLATE: str({
    desc: 'Sendgrid verify email template (keep this secret)',
  }),
  SENDGRID_PASS_RESET_EMAIL_TEMPLATE: str({
    desc: 'Sendgrid reset email template (keep this secret)',
  }),
  SENDGRID_FORM_SUPPORT_EMAIL_TEMPLATE: str({
    desc: 'Sendgrid email template (keep this secret)',
  }),
  APP_NAME: str({
    desc: 'Your name app',
  }),
  APP_DIR: str({
    desc: 'App direction',
  }),
  USER_DASHBOARD1: str({
    desc: 'User Dashboard 1 (keep this secret)',
  }),
  USER_PASS_DASHBOARD1: str({
    desc: 'Password Dashboard 1 (keep this secret)',
  }),
  USER_DASHBOARD2: str({
    desc: 'User Dashboard 2 (keep this secret)',
  }),
  USER_PASS_DASHBOARD2: str({
    desc: 'Password Dashboard 2 (keep this secret)',
  }),
  USER_DASHBOARD3: str({
    desc: 'User Dashboard 3 (keep this secret)',
  }),
  USER_PASS_DASHBOARD3: str({
    desc: 'Password Dashboard 3 (keep this secret)',
  }),
  ADMIN_ADDRES1: str({
    desc: 'Your ADMIN_ADDRES 1',
  }),
  ADMIN_ADDRES2: str({
    desc: 'Your ADMIN_ADDRES 2',
  }),
  ADMIN_ADDRES3: str({
    desc: 'Your ADMIN_ADDRES 3',
  }),
  ADMIN_ADDRES4: str({
    desc: 'Your ADMIN_ADDRES 4',
  }),
  ADMIN_ADDRES5: str({
    desc: 'Your ADMIN_ADDRES 5',
  }),
  ADMIN_ADDRES6: str({
    desc: 'Your ADMIN_ADDRES 6',
  }),
  PORT: num({
    desc: 'Default port wher parse-server will run on',
    default: 1337,
  }),
  HTTP_PORT: num({
    desc: 'Default port wher parse-server will run on',
    default: 1337,
  }),
  CLOUD_PATH: str({
    desc: 'Path to your cloud code',
    default: './build/cloud/main.js',
  }),
  MASTER_KEY: str({
    desc: 'A secret key of your choice (keep this secret)',
  }),
  APPLICATION_ID: str({
    desc: 'An id for your app, can be anything you want',
    default: 'APPLICATION_ID',
  }),
  SERVER_URL: str({
    desc: 'Referenece to your server URL. Replace this when your app is hosted',
    devDefault: 'http://localhost:1337/server',
  }),
  MASTER_KEY_IPS: arrayValidator({
    desc: 'List of master key IPs',
  }),
  SERVER_URL_AUTH: str({
    desc: 'Referenece to your URL. Replace this when your app is hosted',
    devDefault: 'http://localhost:1337',
  }),
  RATE_LIMIT_TTL: num({
    desc: 'Rate limit window in seconds',
    default: 30,
  }),
  RATE_LIMIT_AUTHENTICATED: num({
    desc: 'Rate limit requests per window for authenticated users',
    default: 50,
  }),
  RATE_LIMIT_ANONYMOUS: num({
    desc: 'Rate limit requests per window for anonymous users',
    default: 20,
  }),
  USE_STREAMS: bool({
    desc: 'Enable streams sync',
    default: false,
  }),
  STREAMS_WEBHOOK_URL: str({
    desc: 'Webhook url for streams sync',
    default: '/streams-webhook',
  }),
  IA_URI: str({
    desc: 'URI to the IA service',
    default: 'http://localhost:3000',
  }),
});
