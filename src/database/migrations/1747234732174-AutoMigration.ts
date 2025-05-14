import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1747234732174 implements MigrationInterface {
    name = 'AutoMigration1747234732174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`main_category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`mainCategoryId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`nickName\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL, \`role\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`like\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reactionType\` varchar(255) NOT NULL, \`userId\` int NULL, \`commentId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`parentIdId\` int NULL, \`userId\` int NULL, \`postId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`post\` (\`id\` int NOT NULL AUTO_INCREMENT, \`author\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`userId\` int NULL, \`subCategoryId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sub_category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`categoryId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`category\` ADD CONSTRAINT \`FK_93687121db44dc2ede768252ce6\` FOREIGN KEY (\`mainCategoryId\`) REFERENCES \`main_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`like\` ADD CONSTRAINT \`FK_e8fb739f08d47955a39850fac23\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`like\` ADD CONSTRAINT \`FK_d86e0a3eeecc21faa0da415a18a\` FOREIGN KEY (\`commentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_e5f992714d9a4f450867771776a\` FOREIGN KEY (\`parentIdId\`) REFERENCES \`comment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_c0354a9a009d3bb45a08655ce3b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_94a85bb16d24033a2afdd5df060\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`post\` ADD CONSTRAINT \`FK_5c1cf55c308037b5aca1038a131\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`post\` ADD CONSTRAINT \`FK_803b13a45f01b3bd663ac7addd4\` FOREIGN KEY (\`subCategoryId\`) REFERENCES \`sub_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sub_category\` ADD CONSTRAINT \`FK_51b8c0b349725210c4bd8b9b7a7\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_category\` DROP FOREIGN KEY \`FK_51b8c0b349725210c4bd8b9b7a7\``);
        await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_803b13a45f01b3bd663ac7addd4\``);
        await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_5c1cf55c308037b5aca1038a131\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_94a85bb16d24033a2afdd5df060\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c0354a9a009d3bb45a08655ce3b\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_e5f992714d9a4f450867771776a\``);
        await queryRunner.query(`ALTER TABLE \`like\` DROP FOREIGN KEY \`FK_d86e0a3eeecc21faa0da415a18a\``);
        await queryRunner.query(`ALTER TABLE \`like\` DROP FOREIGN KEY \`FK_e8fb739f08d47955a39850fac23\``);
        await queryRunner.query(`ALTER TABLE \`category\` DROP FOREIGN KEY \`FK_93687121db44dc2ede768252ce6\``);
        await queryRunner.query(`DROP TABLE \`sub_category\``);
        await queryRunner.query(`DROP TABLE \`post\``);
        await queryRunner.query(`DROP TABLE \`comment\``);
        await queryRunner.query(`DROP TABLE \`like\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`category\``);
        await queryRunner.query(`DROP TABLE \`main_category\``);
    }

}
