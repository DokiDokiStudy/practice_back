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

type CategoryNode = { name: string; children?: CategoryNode[] };
type PostMeta = {
  title: string;
  categoryPath: string[];
  authorNick?: string;
  createdAt?: string;
  updateMode?: string;
};

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SEED_ROOT = path.join(PROJECT_ROOT, 'src', 'database', 'seed');
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
  const email = process.env.ADMIN_EMAIL ?? 'test@test.com';
  const password = process.env.ADMIN_PASSWORD ?? 'test1234';
  const name = process.env.ADMIN_NAME ?? '도키도키관리자';
  const nickName = process.env.ADMIN_NICK ?? '도키도키';

  const admin = await usersService.findAdminUser();
  if (!admin) {
    const created = await usersService.createAdminUser({ email, password, name, nickName });
    report.admin = `created: ${email}`;
    return created;
  }
  report.admin = `existing: ${admin.email}`;
  return admin;
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

async function readJson<T>(filePath: string): Promise<T> {
  const txt = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(txt) as T;
}

async function findByParentAndName(
  repo: Repository<Category>,
  parent: Category | null,
  name: string
) {
  return parent
    ? repo.findOne({ where: { name, parent: { id: parent.id } }, relations: ['parent'] })
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
      found = await this.repo.save(this.repo.create({ name, parent: parent ?? undefined }));
      if (!parent) report.categories.rootsCreated.push(name);
      else report.categories.childrenCreated.push(`${parent.name} > ${name}`);
    }
    this.map.set(k, found);
    return found;
  }
}

async function upsertCategoryTreeFromJson(repo: Repository<Category>, nodes: CategoryNode[]) {
  const cache = new CategoryCache(repo);
  const walk = async (node: CategoryNode, parent: Category | null) => {
    if (!node?.name) return;
    const current = await cache.getOrCreate(parent, node.name);
    if (node.children?.length) {
      for (const c of node.children) await walk(c, current);
    }
  };
  for (const n of nodes) await walk(n, null);
}

async function findCategoryByPath(repo: Repository<Category>, pathNames: string[]) {
  let parent: Category | null = null;
  for (const name of pathNames) {
    const found = await findByParentAndName(repo, parent, name);
    if (!found) return null;
    parent = found;
  }
  return parent;
}

function parseCreatedAt(input?: string): Date | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

async function seedPostsFromMarkdownDir(
  postRepo: Repository<Post>,
  catRepo: Repository<Category>,
  usersService: UsersService,
  dir: string,
  dryRun: boolean
) {
  const admin = await usersService.findAdminUser();
  if (!admin) return;

  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return;
  }

  for (const file of files) {
    const full = path.join(dir, file);
    const raw = await fs.readFile(full, 'utf-8');
    const { data, content } = matter(raw);
    const meta = data as PostMeta;

    if (!meta?.title || !Array.isArray(meta?.categoryPath) || meta.categoryPath.length === 0) {
      continue;
    }

    const leaf = await findCategoryByPath(catRepo, meta.categoryPath);
    if (!leaf) continue;

    const existing = await postRepo.findOne({
      where: { title: meta.title, category: { id: leaf.id } as any },
      relations: ['category'],
      select: ['id', 'title'],
    });

    const pathLabel = `[${meta.categoryPath.join(' > ')}] ${meta.title}`;
    const isUpsert = (meta.updateMode || '').toLowerCase() === 'upsert';

    if (!existing) {
      report.posts.created.push(pathLabel);
      if (!dryRun) {
        await postRepo.save({
          user: { id: admin.id } as any,
          author: meta.authorNick ?? admin.nickName ?? '관리자',
          category: { id: leaf.id } as any,
          title: meta.title,
          content,
          createdAt: parseCreatedAt(meta.createdAt),
        });
      }
    } else {
      // 이미 존재하며 updateMode가 'upsert'인 경우 갱신
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
  }
}

// 종합 출력 담당 메소드
function printSummary(args: Args) {
  const sep = '----------------------------------------';
  console.log('\n[Seed Up Summary]');
  console.log(sep);

  console.log(`관리자 계정 : ${report.admin || 'n/a'}`);

  console.log('\n[카테고리]');
  if (report.categories.rootsCreated.length)
    console.log(`  생성된 루트 : ${report.categories.rootsCreated.join(', ')}`);
  if (report.categories.rootsExisting.length)
    console.log(`  기존 루트   : ${report.categories.rootsExisting.join(', ')}`);
  if (report.categories.childrenCreated.length) {
    console.log(`  생성된 하위 (${report.categories.childrenCreated.length}):`);
    report.categories.childrenCreated.forEach((c) => console.log(`    - ${c}`));
  }

  console.log('\n[게시글]');
  console.log(`  생성된 게시글 : ${report.posts.created.length}`);
  if (report.posts.created.length) report.posts.created.forEach((p) => console.log(`    - ${p}`));
  console.log(`  갱신된 게시글 : ${report.posts.updated.length}`);
  if (report.posts.updated.length) report.posts.updated.forEach((p) => console.log(`    - ${p}`));
  console.log(`  스킵된 게시글 : ${report.posts.skipped.length}`);

  console.log(sep);
  console.log(`실행 모드 : ${args.dryRun ? 'Dry-run (DB 변경 없음)' : '실제 DB 반영'}`);
  console.log(sep);
}

async function bootstrap() {
  const args = parseArgs(process.argv);
  console.log('Seed start', args.dryRun ? '(dry-run)' : '');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['warn', 'error'] });
  const ds = app.get<DataSource>(getDataSourceToken());
  const catRepo = ds.getRepository(Category);
  const postRepo = ds.getRepository(Post);
  const usersService = app.get(UsersService);

  await ensureAdmin(usersService);
  await ensureEssentialCategories(catRepo);

  // categories.json 기준으로 카테고리 트리 생성
  const categoriesJsonPath = path.join(SEED_ROOT, 'categories.json');
  try {
    await fs.access(categoriesJsonPath);
    const nodes = await readJson<CategoryNode[] | CategoryNode>(categoriesJsonPath);
    const list = Array.isArray(nodes) ? nodes : [nodes];
    await upsertCategoryTreeFromJson(catRepo, list);
  } catch {
  }

  // posts/*.md 기준으로 포스트 생성/업데이트
  const postsDir = path.join(SEED_ROOT, 'posts');
  await seedPostsFromMarkdownDir(postRepo, catRepo, usersService, postsDir, args.dryRun);

  printSummary(args);
  await app.close();
  console.log('Seed done');
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
