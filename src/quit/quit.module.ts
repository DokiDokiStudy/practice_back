import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuitController } from "./quit.controller";
import { QuitService } from "./quit.service";
import { User } from "../signup/entities/signup.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [QuitController],
  providers: [QuitService],
})
export class QuitModule {}
