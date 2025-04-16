import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { User } from "./signup/entities/signup.entity";
import { UserModule } from "./signup/signup.module";
import { LoginModule } from "./login/login.module";
import { QuitModule } from "./quit/quit.module";
import { EmailCheckModule } from "./emailCheck/emailCheck.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User],
      synchronize: false,
    }),
    UserModule,
    LoginModule,
    QuitModule,
    EmailCheckModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
