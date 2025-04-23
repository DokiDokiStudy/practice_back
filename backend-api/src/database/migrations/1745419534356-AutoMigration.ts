import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1745419534356 implements MigrationInterface {
    name = 'AutoMigration1745419534356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post\` ADD \`author\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`author\``);
    }

}
