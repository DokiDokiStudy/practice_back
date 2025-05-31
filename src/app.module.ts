import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'nestjs_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // TypeORM 이 구동될 때 인식하도록 할 entity 클래스의 경로 지정
      synchronize: true, // 서비스 구동 시 소스 코드 기반으로 DB 스키마 동기화할지 여부, PROD 에서는 false 로 할 것
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      // migrationsTableName: 'migrations', 기본값
    }),
    AuthModule,
    UsersModule,
    PostModule,
    CategoryModule,
    CommentModule,
    LikeModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
