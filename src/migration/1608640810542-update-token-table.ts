import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTokenTable1608640810542 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      'ALTER TABLE token ADD accesstoken varchar(255) AFTER id, CHANGE COLUMN  token refreshtoken AFTER accesstoken;'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('ALTER TABLE token DROP COLUMN accesstoken,  CHANGE COLUMN  refreshtoken token varchar(255);');
  }
}
