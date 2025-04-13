import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import * as dotenv from "dotenv";

dotenv.config();

//TODO: 테이블을 만들어놈 -> 데이터 들어감 -> migration 실행 -> 그럼 그전 데이터들은?
export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User],
    migrations: ["src/db/migrations/*.ts"],
    synchronize: false,
});
