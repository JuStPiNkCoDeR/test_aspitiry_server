import {Training, ActivityTypes} from './models';
import {INIT_SIZE_OF_TRAININGS_REPOSITORY} from '../config';
import {generateTraining} from '../utils';

export type PredicateFunction<T> =
    (element: T, index?: number, array?: T[]) => boolean;

export interface ClassicRepository<T> {
    save(...entities: T[]): void
    get(func: PredicateFunction<T>): T[];
    update(condition: PredicateFunction<T>, toUpdate: Partial<T>): void;
    delete(condition: PredicateFunction<T>): void;
}

export interface ClassicDatabase<T> {
    getRepository<K extends keyof T>(repositoryName: K): T[K];
}

export interface Repositories {
    TRAININGS: ClassicRepository<Training>,
}

/**
 * @description Simple implementation for RAM based repository
 */
export class Repository<T> implements ClassicRepository<T> {
    private data: T[] = [];

    /**
     * @description Simple save logic
     * @param {any[]} entities Data to be inserted into repository
     */
    public save(...entities: T[]): void {
      this.data = [...this.data, ...entities];
    }

    /**
     * @description Gets entities that passed filter function
     * @param {PredicateFunction} func Function for filtering existed data
     * @return {any[]}
     */
    public get(func: PredicateFunction<T>): T[] {
      return this.data.filter(func);
    }

    /**
     * @description Updates existed data
     * @param {PredicateFunction} condition
     *  Function to find exactly that one data instance
     * @param {Partial<any>} toUpdate
     *  Data to update on that object
     */
    public update(condition: PredicateFunction<T>, toUpdate: Partial<T>): void {
      const index = this.data.findIndex(condition);
      const instance = this.data[index];

      this.data[index] = {...instance, ...toUpdate};
    }

    /**
     * @description Delete first data instance that passed condition function
     * @param {PredicateFunction} condition
     */
    public delete(condition: PredicateFunction<T>) {
      const index = this.data.findIndex(condition);

      this.data.splice(index, 1);
    }
}
/**
 * @description Simple implementation of RAM based database
 */
export class Database implements ClassicDatabase<Repositories> {
    private repositories: Repositories = {
      TRAININGS: new Repository<Training>(),
    }

    /**
     * @description Just fill repositories with random data
     *  for presentation purpose
     */
    constructor() {
      this.fillRepositoriesWithInitData();
    }

    /**
     * @description Generate 'mock' data for every repository
     * @private
     */
    private fillRepositoriesWithInitData(): void {
      for (let i = 0; i < INIT_SIZE_OF_TRAININGS_REPOSITORY; i++) {
        this.repositories.TRAININGS.save(generateTraining(i));
      }
    }

    /**
     * @description Returns repository by its name
     * @param {string} repositoryName
     * @return {Repository}
     */
    getRepository<
        K extends keyof Repositories
    >(repositoryName: K): Repositories[K] {
      return this.repositories[repositoryName];
    }
}

