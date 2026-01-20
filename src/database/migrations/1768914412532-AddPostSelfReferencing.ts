import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostSelfReferencing1768914412532 implements MigrationInterface {
  name = 'AddPostSelfReferencing1768914412532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Make categoryId nullable (for thread posts that inherit from parent)
    await queryRunner.query(
      `ALTER TABLE \`post\` MODIFY \`categoryId\` int NULL`,
    );

    // 2. Add parentPostId column (nullable, for self-referencing)
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD \`parentPostId\` int NULL`,
    );

    // 3. Add foreign key constraint for self-referencing with CASCADE delete
    // When a parent post is deleted, all its children (thread replies) are also deleted
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_parentPostId\`
       FOREIGN KEY (\`parentPostId\`) REFERENCES \`post\`(\`id\`)
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // 4. Add index for performance (querying child posts by parent)
    await queryRunner.query(
      `CREATE INDEX \`IDX_post_parentPostId\` ON \`post\` (\`parentPostId\`)`,
    );

    // 5. Add index for categoryId if it doesn't exist (performance optimization)
    await queryRunner.query(
      `CREATE INDEX \`IDX_post_categoryId\` ON \`post\` (\`categoryId\`)`,
    );

    // 6. Add check constraint to ensure business rules
    // Either parentPostId is NULL and categoryId is NOT NULL (standalone post)
    // OR parentPostId is NOT NULL (thread post, category can be inherited)
    // Note: MySQL 8.0.16+ supports CHECK constraints
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD CONSTRAINT \`CHK_post_parent_or_category\`
       CHECK (
         (\`parentPostId\` IS NULL AND \`categoryId\` IS NOT NULL) OR
         (\`parentPostId\` IS NOT NULL)
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order of up() operations

    // 6. Drop check constraint
    await queryRunner.query(
      `ALTER TABLE \`post\` DROP CHECK \`CHK_post_parent_or_category\``,
    );

    // 5. Drop categoryId index
    await queryRunner.query(`DROP INDEX \`IDX_post_categoryId\` ON \`post\``);

    // 4. Drop parentPostId index
    await queryRunner.query(
      `DROP INDEX \`IDX_post_parentPostId\` ON \`post\``,
    );

    // 3. Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_parentPostId\``,
    );

    // 2. Drop parentPostId column
    await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`parentPostId\``);

    // 1. Restore categoryId to NOT NULL
    await queryRunner.query(
      `ALTER TABLE \`post\` MODIFY \`categoryId\` int NOT NULL`,
    );
  }
}
