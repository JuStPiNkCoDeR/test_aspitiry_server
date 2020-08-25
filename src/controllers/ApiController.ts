import {Router, Request, Response} from 'express';
import Joi from 'joi';
import {ClassicRepository} from '../database';
import {Training} from '../database/models';

const GET_TRAININGS_SCHEMA = Joi.object({
  activityType: Joi.string().valid(
      'ALL', 'RUN', 'WALKING', 'BICYCLE', 'SKIING',
  ).required(),
});

const UPDATE_TRAINING_SCHEMA = Joi.object({
  ID: Joi.string().uuid({version: 'uuidv4'}).required(),
  data: Joi.object({
    distance: Joi.number().min(1).max(99).optional(),
    date: Joi.date().optional(),
    activityType: Joi.string().valid(
        'RUN', 'WALKING', 'BICYCLE', 'SKIING',
    ).optional(),
    comment: Joi.string().max(300).optional(),
  }).required(),
});

export interface Controller {
    getRouter(): Router
}
/**
 *
 */
class ApiController implements Controller {
    protected router: Router;
    protected repo: ClassicRepository<Training>;

    /**
     * @param {ClassicRepository} repository
     */
    constructor(repository: ClassicRepository<Training>) {
      this.repo = repository;
      this.router = Router();
      this.router.get('/', this.getTrainings.bind(this));
      this.router.put('/', this.updateTraining.bind(this));
    }

    /**
     * @description Returns filtered trainings
     * @param {Request} req
     * @param {Response} res
     * @protected
     */
    protected getTrainings(req: Request, res: Response): void {
      const input = this.validate(
          GET_TRAININGS_SCHEMA,
          req.query,
          res,
          'Wrong query params',
      );

      if (input === undefined) {
        res.end();
        return;
      }

      const filterFunction = (item: Training) => {
        if (input.activityType === 'ALL') {
          return true;
        } else {
          return item.activityType === input.activityType;
        }
      };
      const trainings = this.repo.get(filterFunction);

      res.json(trainings);
      res.end();
    }

    /**
     * @description Update training
     * @param {Request} req
     * @param {Response} res
     * @protected
     */
    protected updateTraining(req: Request, res: Response): void {
      const input = this.validate(
          UPDATE_TRAINING_SCHEMA,
          req.body,
          res,
          'Wrong body params',
      );

      if (input == undefined) {
        res.end();
        return;
      }

      const condition =
          (item: Training) => item.ID === input.ID;
      this.repo.update(condition, input.data);

      res.end();
    }

    /**
     * @description Validates input and return the value or send error
     * @param {Joi.ObjectSchema} schema
     * @param {any} input
     * @param {Response} res
     * @param {string} errorMessage
     * @protected
     * @return {any}
     */
    protected validate(
        schema: Joi.ObjectSchema,
        input: any,
        res: Response,
        errorMessage: string,
    ): any {
      const {error, value} = GET_TRAININGS_SCHEMA.validate(input);

      if (error != undefined) {
        res.status(400).send(errorMessage);

        return undefined;
      } else {
        return value;
      }
    }
    /**
     * @description Gets current controllers' routes
     * @return {Router}
     */
    getRouter(): Router {
      return this.router;
    }
}

export default ApiController;
