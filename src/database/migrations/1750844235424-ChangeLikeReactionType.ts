import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLikeReactionType1750844235424 implements MigrationInterface {
  name = 'AutoMigration1750844235424';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`like\` DROP COLUMN \`reactionType\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`like\` ADD \`reactionType\` enum ('like', 'disLike') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`like\` DROP COLUMN \`reactionType\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`like\` ADD \`reactionType\` varchar(255) NOT NULL`,
    );
  }
}
