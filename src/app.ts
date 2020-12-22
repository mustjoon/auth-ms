import express, { Request, Response } from 'express';
import { createConnection, getConnectionOptions } from 'typeorm';
import bodyparser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import api from './routes';
import { handleError } from './middleware/error';
import { initDb } from './util/init-db';

// eslint-disable-next-line
require('dotenv').config()

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get('/', (req: Request, res: Response) => {
  return res.status(200).send('xaxa');
});

initDb().then(async () => {
  const connectionOptions = await getConnectionOptions();
  const customOptions = {
    entities: [__dirname + '/entity/*.ts'],
    synchronize: true,
    migrations: [__dirname + '/migrations/*.ts'],
    cli: {
      migrationsDir: __dirname + '/migration',
    },
  };

  Object.assign(connectionOptions, customOptions);
  await createConnection(connectionOptions);

  app.use('/api', api);

  app.use((err, req: Request, res: Response, next) => {
    handleError(err, res);
    next(err);
  });
});

module.exports = app;
