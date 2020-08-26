import {Router, Request, Response} from 'express';
import Joi from 'joi';
import {ClassicRepository} from '../database';
import {ActivityTypes, Training} from '../database/models';
import {v4} from 'uuid';

const SAVE_TRAINING_SCHEMA = Joi.object({
  date: Joi.date().required(),
  fullName: Joi.string().trim().max(99).required(),
  activityType: Joi.string().valid(
      ActivityTypes.RUN,
      ActivityTypes.SKIING,
      ActivityTypes.BICYCLE,
      ActivityTypes.WALKING,
  ).required(),
  distance: Joi.number().min(1).max(99).required(),
  comment: Joi.string().allow('').max(300).optional(),
});

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
        ActivityTypes.RUN,
        ActivityTypes.SKIING,
        ActivityTypes.BICYCLE,
        ActivityTypes.WALKING,
    ).optional(),
    comment: Joi.string().allow('').max(300).required(),
  }).required(),
});

const DELETE_TRAINING_SCHEMA = Joi.object({
  ID: Joi.string().uuid({version: 'uuidv4'}).required(),
});

export interface Controller {
    getRouter(): Router
}

/**
 * @description Handles request to /api url
 *  Works on trainings storage.
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
      this.router.post('/', this.saveTraining.bind(this));
      this.router.get('/', this.getTrainings.bind(this));
      this.router.patch('/', this.updateTraining.bind(this));
      this.router.delete('/', this.deleteTraining.bind(this));
    }

    /**
     * @description Save and return saved instance
     * @param {Request} req
     * @param {Response} res
     * @protected
     */
    protected saveTraining(req: Request, res: Response): void {
      const input = this.validate(
          SAVE_TRAINING_SCHEMA,
          req.body,
          res,
          'Wrong input data',
      );

      if (input === undefined) {
        res.end();
        return;
      }

      const training: Training = {
        ID: v4(),
        date: new Date(input.date),
        fullName: input.fullName,
        activityType: input.activityType,
        distance: input.distance,
        comment: input.comment,
      };

      this.repo.save(training);

      res.json({
        data: training,
      });
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

      res.json({
        data: trainings,
      });
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

      res.sendStatus(204);
    }

    /**
     * @description Delete training if exists
     * @param {Request} req
     * @param {Response} res
     * @protected
     */
    protected deleteTraining(req: Request, res: Response): void {
      const input = this.validate(
          DELETE_TRAINING_SCHEMA,
          req.body,
          res,
          'Wrong condition params',
      );

      if (input === undefined) {
        res.end();
        return;
      }

      const predicate =
          (item: Training) => item.ID === input.ID;
      this.repo.delete(predicate);

      res.sendStatus(204);
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
      const {error, value} = schema.validate(input);

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
