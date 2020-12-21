import { getRepository, Repository, EntityTarget } from 'typeorm';

export class OrmService<T> {
  target: EntityTarget<T>;
  constructor(target: EntityTarget<T>) {
    this.target = target;
  }

  get repository(): Repository<T> {
    try {
      return getRepository(this.target);
    } catch (err) {
      console.log('connection not initialized');
    }
  }

  set repository(repository: Repository<T>) {
    this.repository = repository;
  }
}
