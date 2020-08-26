import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import ApiController from './controllers/ApiController';
import {ClassicDatabase, Database, Repositories} from './database';

/**
 * @description Class wraps express application logic
 */
class Express {
    public app: express.Application
    public db: ClassicDatabase<Repositories>;

    /**
     * @description Initialize Express app with controllers.
     */
    constructor() {
      this.app = express();
      this.db = new Database();
      this.initPreRoutesMiddlewares();
      this.initRoutes();
    }

    /**
     * @description Initialize such middlewares as
     *  logger, parsers, static content etc.
     * @private
     */
    private initPreRoutesMiddlewares(): void {
      this.app.use(logger('dev'));
      this.app.use(express.json());
      this.app.use(express.urlencoded({extended: false}));
      this.app.use(cookieParser());
    }

    /**
     * @description Initialize routes
     * @private
     */
    private initRoutes(): void {
      const apiController = new ApiController(
          this.db.getRepository('TRAININGS'),
      );

      this.app.options('/api', cors());
      this.app.use('/api', cors(), apiController.getRouter());
    }
}

export default Express;
