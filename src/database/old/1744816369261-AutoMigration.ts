import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1744816369261 implements MigrationInterface {
    name = 'AutoMigration1744816369261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`isActive\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`role\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`isActive\``);
    }

}
