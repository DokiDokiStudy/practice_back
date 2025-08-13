import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1751987496655 implements MigrationInterface {
    name = 'AutoMigration1751987496655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`postId\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_74b9b8cd79a1014e50135f266f\` ON \`likes\` (\`userId\`, \`postId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c375aba0f3323c250caeafcb7f\` ON \`likes\` (\`userId\`, \`commentId\`)`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_e2fe567ad8d305fefc918d44f50\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_e2fe567ad8d305fefc918d44f50\``);
        await queryRunner.query(`DROP INDEX \`IDX_c375aba0f3323c250caeafcb7f\` ON \`likes\``);
        await queryRunner.query(`DROP INDEX \`IDX_74b9b8cd79a1014e50135f266f\` ON \`likes\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`postId\``);
    }

}
