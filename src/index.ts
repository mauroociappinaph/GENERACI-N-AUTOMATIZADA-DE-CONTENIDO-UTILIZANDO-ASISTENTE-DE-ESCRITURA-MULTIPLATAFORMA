import Moralis from 'moralis';
import express from 'express';
import cors from 'cors';
import http from 'node:http';
import ParseServer from 'parse-server';
import { parseDashboard } from './parseDashboard';
import { parseServer } from './parseServer';
import { errorHandler } from './middlewares/errorHandler';
import config from './config';
import { apiRouter } from './apiRouter';
import Parse from 'parse/node';
//import createSuper from './utils/createSuper';
import { swaggerDocs } from './swagger/swaggerMiddleware';

export const app = express();

Moralis.start({
  apiKey: config.MORALIS_API_KEY,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(`/${config.SERVER_ENDPOINT}`, parseServer.app);
app.use('/dashboard', parseDashboard);
app.use('/api', apiRouter);
app.use(errorHandler);
app.use(express.static('public'));

swaggerDocs(app);
// let contador = 0;

// const intervalo = setInterval(() => {
//   contador++;
//   console.log(contador);
//   if (contador === 30) {
//     createSuper()
//     clearInterval(intervalo);
//   }
// }, 500);

export const httpServer = http.createServer(app);

httpServer.listen(config.HTTP_PORT, async () => {
  if (config.USE_STREAMS) {
    return config.STREAMS_WEBHOOK_URL;
  }
  return config.HTTP_PORT;
});

ParseServer.createLiveQueryServer(httpServer);
