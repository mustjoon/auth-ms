import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDb1608582644210 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('CREATE DATABASE IF NOT EXIST ' + process.env.TYPEORM_DATABASE);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP DATABASE ' + process.env.TYPEORM_DATABASE);
  }
}
