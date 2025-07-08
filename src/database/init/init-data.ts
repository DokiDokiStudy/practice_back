import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { CategoryService } from 'src/categories/category.service';
import { UsersService } from 'src/users/users.service';
import { Category } from 'src/categories/entities/category.entity';
import { Post } from 'src/posts/entities/post.entity';
import { getDataSourceToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryService = app.get(CategoryService);
  const usersService = app.get(UsersService);
  const dataSource = app.get(getDataSourceToken());
  const categoryRepository = dataSource.getRepository(Category);
  const postRepository = dataSource.getRepository(Post);

  const initialCategories = [
    { name: '공지사항' },
    { name: '자유게시판' },
    { name: 'Docker' },
  ];

  console.log('초기 카테고리 데이터를 생성합니다...');

  for (const categoryData of initialCategories) {
    try {
      const isExist = await categoryRepository.findOne({
        where: { name: categoryData.name },
      });
      if (!isExist) await categoryService.create(categoryData);
    } catch (error) {
      console.error(
        `${categoryData.name} 생성 실패:`,
        error instanceof Error ? error.message : '알 수 없는 오류',
      );
    }
  }

  // 최고관리자 계정 확인 및 생성
  console.log('최고관리자 계정을 확인합니다...');
  const adminUser: User | null = await usersService.findAdminUser();

  if (!adminUser) {
    console.log('최고관리자 계정이 없습니다. 생성합니다...');
    try {
      await usersService.createAdminUser({
        email: 'admin@example.com',
        password: 'admin1234',
        name: '시스템관리자',
        nickName: '관리자',
      });
    } catch (error) {
      console.error(
        '최고관리자 계정 생성 실패:',
        error instanceof Error ? error.message : '알 수 없는 오류',
      );
    }
  }

  try {
    const dockerCategory = await categoryRepository.findOne({
      where: { name: 'Docker' },
    });

    if (dockerCategory && adminUser) {
      // 초기 게시물 생성
      const initialPost = {
        categoryId: dockerCategory.id,
        title: 'Docker 초기 설정 가이드',
        content: `
          안녕하세요! Docker 초기 설정에 대한 가이드입니다.

          ## Docker 설치
          1. Docker Desktop 다운로드
          2. 설치 및 실행
          3. 기본 설정 확인

          ## 기본 명령어
          - \`docker --version\`: 버전 확인
          - \`docker ps\`: 실행 중인 컨테이너 목록
          - \`docker images\`: 이미지 목록

          이 게시물은 초기 데이터로 자동 생성되었습니다.
        `,
      };

      await postRepository.save({
        user: { id: adminUser.id },
        author: adminUser.nickName || '관리자',
        category: dockerCategory,
        title: initialPost.title,
        content: initialPost.content,
      });

      console.log('초기 게시물 생성 완료:', initialPost.title);
    } else {
      console.error('Docker 카테고리 또는 테스트 사용자를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error(
      '초기 게시물 생성 실패:',
      error instanceof Error ? error.message : '알 수 없는 오류',
    );
  }

  console.log('초기 데이터 생성이 완료되었습니다.');

  await app.close();
}

bootstrap();
