import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../signup/entities/signup.entity";
import { EmailCheckController } from "./emailCheck.controller";
import { EmailCheckService } from "./emailCheckService";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [EmailCheckController],
  providers: [EmailCheckService],
})
export class EmailCheckModule {}
