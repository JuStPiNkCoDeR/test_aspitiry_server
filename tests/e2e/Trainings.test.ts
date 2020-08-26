import request from 'supertest';
import Express from '../../src/Express';
import {ActivityTypes} from '../../src/database/models';

const app = new Express().app;

describe('ApiController endpoints test', () => {
  describe('POST endpoint', () => {
    it('should create new instance(date as number)', async () => {
      const date = Date.now();

      const res = await request(app)
          .post('/api/')
          .send({
            date,
            fullName: 'Awesome name',
            activityType: ActivityTypes.WALKING,
            distance: 2,
            comment: '',
          })
          .expect(200);
      expect(res.body).toBeDefined();

      const instanceData = res.body.data;
      expect(instanceData).toBeDefined();
      expect(instanceData).toMatchObject({
        date: new Date(date).toISOString(),
        fullName: 'Awesome name',
        activityType: ActivityTypes.WALKING,
        distance: 2,
        comment: '',
      });
    });

    it('should reject on wrong input data', (done) => {
      request(app)
          .post('/api/')
          .send({
            wrongField: 'wrong value',
          })
          .expect(400, done);
    });

    it('should reject on invalid input data', (done) => {
      request(app)
          .post('/api/')
          .send({
            date: Date.now(),
            fullName: 'Awesome name',
            activityType: '?',
            distance: 2,
            comment: '',
          })
          .expect(400, done);
    });
  });

  describe('GET endpoint', () => {
    it('should get arbitrary instances', (done) => {
      request(app)
          .get('/api/?activityType=ALL')
          .expect(200, done);
    });

    it('should reject on wrong filter params', (done) => {
      request(app)
          .get('/api/?whatFilter=filterHere')
          .expect(400, done);
    });
  });

  describe('PATCH endpoint', () => {
    it('should partially update data the instance', async () => {
      const date = Date.now();

      const createdTrainingResponse = await request(app)
          .post('/api/')
          .send({
            date,
            fullName: 'Awesome name',
            activityType: ActivityTypes.WALKING,
            distance: 2,
            comment: 'No comment',
          })
          .expect(200);
      expect(createdTrainingResponse.body).toBeDefined();

      const instanceData = createdTrainingResponse.body.data;
      expect(instanceData).toBeDefined();
      expect(instanceData).toMatchObject({
        date: new Date(date).toISOString(),
        fullName: 'Awesome name',
        activityType: ActivityTypes.WALKING,
        distance: 2,
        comment: 'No comment',
      });
      expect(instanceData).toHaveProperty('ID');

      await request(app)
          .patch('/api/')
          .send({
            ID: instanceData.ID,
            data: {
              comment: 'Marvelous comment',
            },
          })
          .expect(200);
    });

    it('should reject on empty ID field', (done) => {
      request(app)
          .patch('/api/')
          .send({
            data: {
              comment: '',
            },
          })
          .expect(400, done);
    });

    it('should reject on wrong data field', (done) => {
      request(app)
          .patch('/api/')
          .send({
            ID: 'some id',
            data: {
              wtfField: '?!?',
            },
          })
          .expect(400, done);
    });
  });

  describe('DELETE endpoint', () => {
    it('should successfully delete instance', async () => {
      const date = Date.now();

      const createdTrainingResponse = await request(app)
          .post('/api/')
          .send({
            date,
            fullName: 'Awesome name',
            activityType: ActivityTypes.WALKING,
            distance: 50,
            comment: '',
          })
          .expect(200);
      expect(createdTrainingResponse.body).toBeDefined();

      const instanceData = createdTrainingResponse.body.data;
      expect(instanceData).toBeDefined();
      expect(instanceData).toMatchObject({
        date: new Date(date).toISOString(),
        fullName: 'Awesome name',
        activityType: ActivityTypes.WALKING,
        distance: 50,
        comment: '',
      });
      expect(instanceData).toHaveProperty('ID');

      let allTrainingsResponse = await request(app)
          .get('/api/?activityType=ALL')
          .expect(200);

      let allTrainings = allTrainingsResponse.body;
      expect(allTrainings).toHaveProperty('data');
      expect(allTrainings.data).toBeInstanceOf(Array);

      const preDeleteCountOfTrainings = allTrainings.data.length;

      await request(app)
          .delete('/api/')
          .send({
            ID: instanceData.ID,
          })
          .expect(200);

      allTrainingsResponse = await request(app)
          .get('/api/?activityType=ALL')
          .expect(200);

      allTrainings = allTrainingsResponse.body;
      expect(allTrainings).toHaveProperty('data');
      expect(allTrainings.data).toBeInstanceOf(Array);

      const currentCountOfTrainings = allTrainings.data.length;

      expect(
          preDeleteCountOfTrainings - currentCountOfTrainings === 1,
      ).toBe(true);
    });

    it('should reject on empty ID input field', (done) => {
      request(app)
          .delete('/api/')
          .send({})
          .expect(400, done);
    });
  });
});
