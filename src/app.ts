import express, { Request, Response } from 'express';
import { createConnection, getConnectionOptions } from 'typeorm';
import bodyparser from 'body-parser';
import cors from 'cors';

import api from './routes';
import { handleError } from './helpers/error';

const port = process.env.PORT || 1337;

const init = async (): Promise<void> => {
  const connectionOptions = await getConnectionOptions();
  Object.assign(connectionOptions, { entities: [__dirname + '/entity/*.ts'], synchronize: true });

  createConnection(connectionOptions).then(async () => {
    const app = express();

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(cors());

    app.get('/', (req: Request, res: Response) => {
      return res.status(200).send('Welcome');
    });

    app.use('/api', api);

    app.use((err, req: Request, res: Response, next) => {
      handleError(err, res);
      next(err);
    });

    app.listen(port, () => {
      console.log('  App is running at http://localhost:%d in %s mode', port, app.get('env'));
      console.log('  Press CTRL-C to stop\n');
    });
  });
};

init();
