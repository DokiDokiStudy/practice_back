import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DataSource, IsNull, Repository } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';
import matter = require('gray-matter');

import { Category } from 'src/categories/entities/category.entity';
import { Post } from 'src/posts/entities/post.entity';
import { UsersService } from 'src/users/users.service';

type PostMeta = {
  title?: string;
  categoryPath?: string[];
  authorNick?: string;
  createdAt?: string;
  updateMode?: string;
};

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SEED_ROOT = path.join(PROJECT_ROOT, 'src', 'database', 'seed');
const FOLDER_ROOT = path.join(SEED_ROOT, 'categories');
const ESSENTIAL_ROOTS = new Set(['공지사항', '자유게시판', 'Docker']);

type Args = {
  json: boolean;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Args {
  // npm run … 에서 -- 없이 준 것도 잡아주기..
  const raw = (() => {
    try {
      const parsed = JSON.parse(process.env.npm_config_argv || '{}');
      if (Array.isArray(parsed?.original)) return parsed.original.slice(1);
    } catch {}
    return argv.slice(2);
  })();

  const flags = new Set<string>();
  for (const a of raw) {
    if (!a) continue;
    if (a === '--') continue;
    if (a.startsWith('--')) flags.add(a.replace(/^-+/, ''));
  }
  return {
    json: flags.has('json') || !!process.env.SEED_JSON,
    dryRun: flags.has('dry-run') || !!process.env.SEED_DRY_RUN,
  };
}

const report = {
  admin: '' as string,
  categories: {
    rootsCreated: [] as string[],
    rootsExisting: [] as string[],
    childrenCreated: [] as string[],
  },
  posts: {
    created: [] as string[],
    updated: [] as string[], // upsert로 갱신된 항목
    skipped: [] as string[],
  },
};

async function ensureAdmin(usersService: UsersService) {
  const email = process.env.ADMIN_EMAIL ?? 'test@naver.com';
  const password = process.env.ADMIN_PASSWORD ?? '12341234';
  const name = process.env.ADMIN_NAME ?? '도키도키관리자';
  const nickName = process.env.ADMIN_NICK ?? '도키도키';

  try {
    // 먼저 관리자 계정이 있는지 확인
    const admin = await usersService.findAdminUser();
    if (admin) {
      report.admin = `existing: ${admin.email}`;
      return admin;
    }

    // 관리자 계정이 없으면 이메일 중복 확인
    const emailCheck = await usersService.checkEmail(email);
    if (!emailCheck.available) {
      // 이메일은 존재하지만 관리자가 아닌 경우
      console.warn(
        `Email ${email} exists but user is not admin. Please check manually.`,
      );
      report.admin = `email exists but not admin: ${email}`;
      return null;
    }

    // 관리자 계정 생성
    const created = await usersService.createAdminUser({
      email,
      password,
      name,
      nickName,
    });
    report.admin = `created: ${email}`;
    return created.data; // createAdminUser는 wrapper 객체를 반환하므로 .data 접근
  } catch (error) {
    // 중복 이메일 에러인 경우 특별 처리
    if (
      error.message?.includes('이미 존재하는 이메일') ||
      error.code === 'ER_DUP_ENTRY'
    ) {
      console.warn(
        `Admin email ${email} already exists but findAdminUser failed. Attempting to find existing admin...`,
      );

      // 다시 관리자 계정 찾기 시도
      try {
        const existingAdmin = await usersService.findAdminUser();
        if (existingAdmin) {
          report.admin = `existing (after error): ${existingAdmin.email}`;
          return existingAdmin;
        }
      } catch (findError) {
        console.warn(
          'Could not find admin after duplicate error:',
          findError.message,
        );
      }

      report.admin = `error: email exists but admin lookup failed`;
      console.error('Admin user setup failed due to email conflict');
      return null; // null 반환하여 계속 진행
    }

    console.error('Error ensuring admin user:', error);
    throw error;
  }
}

async function ensureEssentialCategories(catRepo: Repository<Category>) {
  for (const name of ESSENTIAL_ROOTS) {
    try {
      const exists = await catRepo.findOne({
        where: { name, parent: IsNull() },
      });
      if (!exists) {
        await catRepo.save(catRepo.create({ name }));
        report.categories.rootsCreated.push(name);
      } else {
        report.categories.rootsExisting.push(name);
      }
    } catch (error) {
      console.error(`Error creating essential category ${name}:`, error);
      throw error;
    }
  }
}

async function findByParentAndName(
  repo: Repository<Category>,
  parent: Category | null,
  name: string,
) {
  return parent
    ? repo.findOne({
        where: { name, parent: { id: parent.id } },
        relations: ['parent'],
      })
    : repo.findOne({ where: { name, parent: IsNull() } });
}

// 경로 기반 업서트 캐시 (N+1 방어용)
class CategoryCache {
  private key = (parentId: number | 0, name: string) => `${parentId}:${name}`;
  private map = new Map<string, Category>();

  constructor(private repo: Repository<Category>) {}

  async getOrCreate(parent: Category | null, name: string): Promise<Category> {
    const k = this.key(parent?.id || 0, name);
    const hit = this.map.get(k);
    if (hit) return hit;

    let found = await findByParentAndName(this.repo, parent, name);
    if (!found) {
      found = await this.repo.save(
        this.repo.create({ name, parent: parent ?? undefined }),
      );
      if (!parent) report.categories.rootsCreated.push(name);
      else report.categories.childrenCreated.push(`${parent.name} > ${name}`);
    }
    this.map.set(k, found);
    return found;
  }
}

function parseCreatedAt(input?: string): Date | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

function deriveTitle(fileName: string): string {
  const base = fileName.replace(/\.md$/i, '');
  // 숫자, 점, 언더스코어, 하이픈으로 시작하는 prefix 제거
  const stripped = base.replace(/^[\d._-]+\s*/, '');
  // 하이픈과 언더스코어를 공백으로 변환하고 정리
  return stripped.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function seedFromFolderStructure(
  postRepo: Repository<Post>,
  catRepo: Repository<Category>,
  usersService: UsersService,
  rootDir: string,
  dryRun: boolean,
) {
  const admin = await usersService.findAdminUser();
  if (!admin) {
    console.warn('No admin user found, skipping post creation');
    return;
  }

  const cache = new CategoryCache(catRepo);

  const walk = async (dir: string, categoryPath: string[]) => {
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      console.warn(`Cannot read directory ${dir}:`, error.message);
      return; // 디렉토리 접근 실패시 조용히 넘어감
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // 숨김 파일/폴더 스킵

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // 하위 디렉토리 재귀 처리
        await walk(fullPath, [...categoryPath, entry.name]);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

      try {
        // 마크다운 파일 처리
        const raw = await fs.readFile(fullPath, 'utf-8');
        let meta: PostMeta = {};
        let content = raw;

        try {
          const parsed = matter(raw);
          meta = (parsed.data || {}) as PostMeta;
          content = parsed.content;
        } catch {
          // frontmatter 파싱 실패시 원본 내용 사용
        }

        // 카테고리 경로 결정: meta에서 지정되었으면 그것 사용, 아니면 폴더 구조 사용
        const finalCategoryPath =
          Array.isArray(meta.categoryPath) && meta.categoryPath.length > 0
            ? meta.categoryPath
            : categoryPath;

        if (finalCategoryPath.length === 0) continue; // 루트에 직접 파일이 있으면 스킵

        // 카테고리 생성/확보
        let currentCategory: Category | null = null;
        for (const categoryName of finalCategoryPath) {
          currentCategory = await cache.getOrCreate(
            currentCategory,
            categoryName.trim(),
          );
        }

        if (!currentCategory) continue;

        // 제목 결정: meta에서 지정되었으면 그것 사용, 아니면 파일명에서 추출
        const title = meta.title?.trim() || deriveTitle(entry.name);
        if (!title) continue;

        // 기존 포스트 확인
        const existing = await postRepo.findOne({
          where: { title, category: { id: currentCategory.id } as any },
          relations: ['category'],
          select: ['id', 'title'],
        });

        const pathLabel = `[${finalCategoryPath.join(' > ')}] ${title}`;
        const isUpsert = (meta.updateMode || '').toLowerCase() === 'upsert';

        if (!existing) {
          // 새 포스트 생성
          report.posts.created.push(pathLabel);
          if (!dryRun) {
            await postRepo.save({
              user: { id: admin.id } as any,
              author: meta.authorNick ?? admin.nickName ?? '관리자',
              category: { id: currentCategory.id } as any,
              title,
              content,
              createdAt: parseCreatedAt(meta.createdAt),
            });
          }
        } else {
          // 기존 포스트 처리
          if (isUpsert) {
            report.posts.updated.push(pathLabel);
            if (!dryRun) {
              const patch: Partial<Post> = {
                content,
                author: meta.authorNick ?? admin.nickName ?? '관리자',
              };
              const ct = parseCreatedAt(meta.createdAt);
              if (ct) patch.createdAt = ct;

              await postRepo.update({ id: existing.id }, patch);
            }
          } else {
            report.posts.skipped.push(pathLabel);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${fullPath}:`, error);
        // 파일 처리 실패시 계속 진행
      }
    }
  };

  await walk(rootDir, []);
}

// 종합 출력 담당 메소드
function printSummary(args: Args) {
  const sep = '----------------------------------------';
  console.log('\n[Folder-based Seed Up Summary]');
  console.log(sep);

  console.log(`관리자 계정 : ${report.admin || 'n/a'}`);

  console.log('\n[카테고리]');
  if (report.categories.rootsCreated.length)
    console.log(`  생성된 루트 : ${report.categories.rootsCreated.join(', ')}`);
  if (report.categories.rootsExisting.length)
    console.log(
      `  기존 루트   : ${report.categories.rootsExisting.join(', ')}`,
    );
  if (report.categories.childrenCreated.length) {
    console.log(`  생성된 하위 (${report.categories.childrenCreated.length}):`);
    report.categories.childrenCreated.forEach((c) => console.log(`    - ${c}`));
  }

  console.log('\n[게시글]');
  console.log(`  생성된 게시글 : ${report.posts.created.length}`);
  if (report.posts.created.length)
    report.posts.created.forEach((p) => console.log(`    - ${p}`));
  console.log(`  갱신된 게시글 : ${report.posts.updated.length}`);
  if (report.posts.updated.length)
    report.posts.updated.forEach((p) => console.log(`    - ${p}`));
  console.log(`  스킵된 게시글 : ${report.posts.skipped.length}`);

  console.log(sep);
  console.log(
    `실행 모드 : ${args.dryRun ? 'Dry-run (DB 변경 없음)' : '실제 DB 반영'} / 폴더 구조 기반`,
  );
  console.log(`소스 디렉토리 : ${FOLDER_ROOT}`);
  console.log(sep);
}

async function bootstrap() {
  const args = parseArgs(process.argv);
  console.log('Folder-based Seed start', args.dryRun ? '(dry-run)' : '');

  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['warn', 'error'],
    });
    const ds = app.get(DataSource);
    const catRepo = ds.getRepository(Category);
    const postRepo = ds.getRepository(Post);
    const usersService = app.get(UsersService);

    await ensureAdmin(usersService);
    await ensureEssentialCategories(catRepo);

    // 폴더 구조 기반으로 카테고리 및 포스트 생성
    await seedFromFolderStructure(
      postRepo,
      catRepo,
      usersService,
      FOLDER_ROOT,
      args.dryRun,
    );

    printSummary(args);
    console.log('Folder-based Seed done');
  } catch (error) {
    console.error('Seed operation failed:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

bootstrap().catch((e) => {
  console.error('Bootstrap failed:', e);
  process.exit(1);
});
