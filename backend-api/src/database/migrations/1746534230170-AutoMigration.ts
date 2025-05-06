import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1746534230170 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Category 테이블
    await queryRunner.query(`
        CREATE TABLE \`category\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`name\` varchar(255) NOT NULL UNIQUE,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
    `);

    // Subcategory 테이블
    await queryRunner.query(`
        CREATE TABLE \`subcategory\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`categoryId\` int NOT NULL,
            \`name\` varchar(255) NOT NULL UNIQUE,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_subcategory_category\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB
    `);

    // Post 테이블 컬럼 추가
    await queryRunner.query(`ALTER TABLE \`post\` ADD \`categoryId\` int NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`post\` ADD \`subcategoryId\` int NULL`);
    await queryRunner.query(`ALTER TABLE \`post\` ADD \`isActive\` boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE \`post\` ADD \`viewCount\` int NOT NULL DEFAULT 0`);

    await queryRunner.query(`
        ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_category\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_subcategory\` FOREIGN KEY (\`subcategoryId\`) REFERENCES \`subcategory\`(\`id\`) ON DELETE SET NULL
    `);

    // Comment 테이블
    await queryRunner.query(`
        CREATE TABLE \`comment\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`content\` text NOT NULL,
            \`authorId\` int NOT NULL,
            \`postId\` int NOT NULL,
            \`parentId\` int NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deletedAt\` datetime(6) NULL,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_comment_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE,
            CONSTRAINT \`FK_comment_post\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE,
            CONSTRAINT \`FK_comment_parent\` FOREIGN KEY (\`parentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB
    `);

    // CommentLike 테이블 추가
    await queryRunner.query(`
        CREATE TABLE \`comment_like\` (
            \`commentId\` int NOT NULL,
            \`userId\` int NOT NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`commentId\`, \`userId\`),
            CONSTRAINT \`FK_commentlike_comment\` FOREIGN KEY (\`commentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE CASCADE,
            CONSTRAINT \`FK_commentlike_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`comment_like\``);
    await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_subcategory\``);
    await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_category\``);
    await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`viewCount\``);
    await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`isActive\``);
    await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`subcategoryId\``);
    await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`categoryId\``);
    await queryRunner.query(`DROP TABLE \`comment\``);
    await queryRunner.query(`DROP TABLE \`subcategory\``);
    await queryRunner.query(`DROP TABLE \`category\``);
  }
}