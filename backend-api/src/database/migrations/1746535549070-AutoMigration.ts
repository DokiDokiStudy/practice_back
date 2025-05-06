import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1746535549070 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE \`category\`
          ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          ADD \`deletedAt\` datetime(6) NULL
        `);
    
        await queryRunner.query(`
          ALTER TABLE \`subcategory\`
          ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          ADD \`deletedAt\` datetime(6) NULL
        `);
    
        await queryRunner.query(`
          ALTER TABLE \`post\`
          ADD \`likeCount\` int NOT NULL DEFAULT 0
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`likeCount\``);
    
        await queryRunner.query(`ALTER TABLE \`subcategory\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`subcategory\` DROP COLUMN \`deletedAt\``);
    
        await queryRunner.query(`ALTER TABLE \`category\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`category\` DROP COLUMN \`deletedAt\``);
      }
}
