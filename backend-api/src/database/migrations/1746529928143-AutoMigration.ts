import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AutoMigration1746529928143 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("user", "name");

    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "securityQuestion",
        type: "varchar",
        length: "255",
        isNullable: false,
        default: "''",
      })
    );

    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "securityAnswer",
        type: "varchar",
        length: "255",
        isNullable: false,
        default: "''",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백 시 컬럼 제거
    await queryRunner.dropColumn("user", "securityAnswer");
    await queryRunner.dropColumn("user", "securityQuestion");

    // name 컬럼 복구
    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "name",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );
  }
}