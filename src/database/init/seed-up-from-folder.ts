import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
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
  updateMode?: string; // upsert 지원
};

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SEED_ROOT = path.join(PROJECT_ROOT, 'src', 'database', 'seed');
const FOLDER_ROOT = path.join(SEED_ROOT, 'categories'); // 폴더 기반 루트
const ESSENTIAL_ROOTS = new Set(['공지사항', '자유게시판', 'Docker']);

type Args = {
  dryRun: boolean;
};

function parseArgs(argv: string[]): Args {
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
    updated: [] as string[],
    skipped: [] as string[],
  },
};

async function ensureAdmin(usersService: UsersService) {
  const email = process.env.ADMIN_EMAIL ?? 'test@test.com';
  const password = process.env.ADMIN_PASSWORD ?? 'test1234';
  const name = process.env.ADMIN_NAME ?? '도키도키관리자';
  const nickName = process.env.ADMIN_NICK ?? '도키도키';

  const findByEmailFn =
    (usersService as any).findByEmail ||
    (usersService as any).findUserByEmail ||
    (usersService as any).getByEmail;

  // 1) 우선 관리자 계정 존재 확인
  let existing = await usersService.findAdminUser();

  // 2) 관리자 못찾았어도 동일 이메일 사용자 존재하면 활용
  if (!existing && findByEmailFn) {
    try {
      existing = await findByEmailFn.call(usersService, email);
    } catch {}
  }

  if (existing) {
    report.admin = `existing: ${existing.email}`;
    return existing;
  }

  // 3) 생성 시도 (중복 예외 방어)
  try {
    const created = await usersService.createAdminUser({
      email,
      password,
      name,
      nickName,
    });
    report.admin = `created: ${email}`;
    return created;
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') {
      // 레이스 혹은 기존 존재 -> 다시 조회
      let dup: any = null; // fix: 타입 오류 (기존 let dup = null 로 null 타입 고정)
      if (findByEmailFn) {
        try {
          dup = await findByEmailFn.call(usersService, email);
        } catch {}
      }
      if (!dup) {
        try {
          dup = await usersService.findAdminUser();
        } catch {}
      }
      report.admin = `existing (dup): ${email}`;
      return dup;
    }
    throw e;
  }
}

async function ensureEssentialCategories(catRepo: Repository<Category>) {
  for (const name of ESSENTIAL_ROOTS) {
    const exists = await catRepo.findOne({ where: { name, parent: IsNull() } });
    if (!exists) {
      await catRepo.save(catRepo.create({ name }));
      report.categories.rootsCreated.push(name);
    } else {
      report.categories.rootsExisting.push(name);
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

class CategoryCache {
  private map = new Map<string, Category>();
  private key = (parentId: number | 0, name: string) => `${parentId}:${name}`;
  constructor(private repo: Repository<Category>) {}
  async getOrCreate(parent: Category | null, name: string) {
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
  return isNaN(d.getTime()) ? undefined : d;
}

function deriveTitle(fileName: string): string {
  const base = fileName.replace(/\.md$/i, '');
  const stripped = base.replace(/^[\d._-]+\s*/, '');
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
  if (!admin) return;
  const cache = new CategoryCache(catRepo);

  const walk = async (dir: string, relParts: string[]) => {
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, [...relParts, entry.name]);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

      const raw = await fs.readFile(full, 'utf-8');
      let meta: PostMeta = {};
      let content = raw;
      try {
        const parsed = matter(raw);
        meta = (parsed.data || {}) as PostMeta;
        content = parsed.content;
      } catch {}
      const categoryPath =
        Array.isArray(meta.categoryPath) && meta.categoryPath.length
          ? meta.categoryPath
          : relParts;
      if (!categoryPath.length) continue;

      // 카테고리 확보/생성
      let cat: Category | null = null;
      for (const seg of categoryPath)
        cat = await cache.getOrCreate(cat, seg.trim());
      if (!cat) continue;

      const title = meta.title?.trim() || deriveTitle(entry.name);
      if (!title) continue;

      const existing = await postRepo.findOne({
        where: { title, category: { id: cat.id } as any },
        select: ['id', 'title'],
      });

      const label = `[${categoryPath.join(' > ')}] ${title}`;
      const isUpsert = (meta.updateMode || '').toLowerCase() === 'upsert';

      if (!existing) {
        report.posts.created.push(label);
        if (!dryRun) {
          await postRepo.save({
            user: { id: admin.id } as any,
            author: meta.authorNick ?? admin.nickName ?? '관리자',
            category: { id: cat.id } as any,
            title,
            content,
            createdAt: parseCreatedAt(meta.createdAt),
          });
        }
      } else if (isUpsert) {
        report.posts.updated.push(label);
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
        report.posts.skipped.push(label);
      }
    }
  };
  await walk(rootDir, []);
}

function printSummary(args: Args) {
  const sep = '----------------------------------------';
  console.log('\n[Folder Seed Up Summary]');
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
  console.log(`  생성 : ${report.posts.created.length}`);
  console.log(`  갱신 : ${report.posts.updated.length}`);
  console.log(`  스킵 : ${report.posts.skipped.length}`);
  console.log(sep);
  console.log(
    `실행 모드 : ${args.dryRun ? 'Dry-run' : '실제 DB 반영'} / 폴더 기반 전용`,
  );
  console.log(sep);
}

async function bootstrap() {
  const args = parseArgs(process.argv);
  console.log('Folder Seed start', args.dryRun ? '(dry-run)' : '');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });
  const ds = app.get<DataSource>(getDataSourceToken());
  const catRepo = ds.getRepository(Category);
  const postRepo = ds.getRepository(Post);
  const usersService = app.get(UsersService);

  await ensureAdmin(usersService);
  await ensureEssentialCategories(catRepo);
  await seedFromFolderStructure(
    postRepo,
    catRepo,
    usersService,
    FOLDER_ROOT,
    args.dryRun,
  );

  printSummary(args);
  await app.close();
  console.log('Folder Seed done');
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
