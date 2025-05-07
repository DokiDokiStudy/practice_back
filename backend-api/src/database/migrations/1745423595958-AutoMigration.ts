import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1745423595958 implements MigrationInterface {
    name = 'AutoMigration1745423595958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post\` ADD \`deletedAt\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`deletedAt\``);
    }

}
