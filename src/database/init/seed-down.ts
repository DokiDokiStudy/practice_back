import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository, In } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';
import matter = require('gray-matter');
import { Category } from 'src/categories/entities/category.entity';
import { Post } from 'src/posts/entities/post.entity';
import { UsersService } from 'src/users/users.service';
import { Comment } from 'src/comments/entities/comment.entity'; 

type CategoryNode = { name: string; children?: CategoryNode[] };
type PostMeta = { title: string; categoryPath: string[] };

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SEED_ROOT = path.join(PROJECT_ROOT, 'src', 'database', 'seed');

const report = {
  postsDeleted: 0,
  categoriesDeleted: 0,
  adminDeleted: false,
};

function parseArgs(argv: string[]) {
  const flags = new Set<string>();
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a) continue;
    if (a === '--') continue;
    if (a.startsWith('--')) flags.add(a.replace(/^-+/, ''));
  }
  if (process.env.SEED_ALL) flags.add('all');
  if (process.env.SEED_CATEGORY) flags.add('category');
  if (process.env.SEED_POSTS) flags.add('posts');
  if (process.env.SEED_ADMIN) flags.add('admin');

  return {
    all: flags.has('all'),
    category: flags.has('category'),
    posts: flags.has('posts'),
    admin: flags.has('admin'),
  };
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

async function findCategoryByPath(repo: Repository<Category>, pathNames: string[]) {
  let parent: Category | null = null;
  for (const name of pathNames) {
    const found = await findByParentAndName(repo, parent, name);
    if (!found) return null;
    parent = found;
  }
  return parent;
}

/** --posts: posts/*.md에 해당하는 포스트만 삭제 */
async function deletePostsFromMarkdownDir(
  postRepo: Repository<Post>,
  catRepo: Repository<Category>,
  usersService: UsersService,
  dir: string
) {
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return;
  }
  for (const file of files) {
    const full = path.join(dir, file);
    const raw = await fs.readFile(full, 'utf-8');
    const { data } = matter(raw);
    const meta = data as PostMeta;
    if (!meta?.title || !Array.isArray(meta?.categoryPath) || meta.categoryPath.length === 0) continue;

    const leaf = await findCategoryByPath(catRepo, meta.categoryPath);
    if (!leaf) continue;

    const posts = await postRepo.find({
      where: { title: meta.title, category: { id: leaf.id } as any },
      relations: ['category'],
    });
    if (posts.length) {
      await postRepo.remove(posts);
      report.postsDeleted += posts.length;
    }
  }
}

/** --category: categories.json 트리를 하위부터 삭제 */
async function deleteCategoriesFromJson(catRepo: Repository<Category>, postRepo: Repository<Post>, commentRepo: Repository<Comment>) {
  const categoriesJson = path.join(SEED_ROOT, 'categories.json');
  await fs.access(categoriesJson); // 없으면 throw
  const nodes = await readJson<CategoryNode[] | CategoryNode>(categoriesJson);
  const list = Array.isArray(nodes) ? nodes : [nodes];

  // 트리의 모든 노드 경로를 leaf부터 수집해 역순 삭제
  const flattenPaths: string[][] = [];
  function walk(node: CategoryNode, prefix: string[]) {
    const current = [...prefix, node.name];
    if (node.children?.length) {
      node.children.forEach((c) => walk(c, current));
    }
    flattenPaths.push(current);
  }
  list.forEach((n) => walk(n, []));

  flattenPaths.sort((a, b) => b.length - a.length);

  for (const pathNames of flattenPaths) {
    const parentPath = pathNames.slice(0, -1);
    const name = pathNames[pathNames.length - 1];

    let parent: Category | null = null;
    if (parentPath.length) {
      parent = await findCategoryByPath(catRepo, parentPath);
      if (!parent) continue;
    }

    const target = await findByParentAndName(catRepo, parent, name);
    if (!target) continue;

    const withChildren = await catRepo.findOne({ where: { id: target.id }, relations: ['children'] });
    if (!withChildren) continue;

    // 1) 서브트리 카테고리 id
    const subtreeIds = await collectDescendantIds(catRepo, withChildren);

    // 2) 서브트리의 포스트 id 조회
    const posts = await postRepo.find({
      where: { category: In(subtreeIds) as any },
      select: ['id'],
    });
    const postIds = posts.map(p => p.id);
    if (postIds.length) {
      // 3) 코멘트 선삭제
      await commentRepo.delete({ post: In(postIds) as any }); // (또는 { postId: In(postIds) })
      // 4) 포스트 삭제
      await postRepo.delete({ id: In(postIds) as any });
    }

    // 5) 카테고리 삭제
    await catRepo.remove(withChildren);
    report.categoriesDeleted += 1;
  }
}

/** 타깃 노드의 모든 하위 카테고리 id 수집 */
async function collectDescendantIds(repo: Repository<Category>, root: Category): Promise<number[]> {
  const ids: number[] = [root.id];
  const stack: Category[] = [root];
  while (stack.length) {
    const cur = stack.pop()!;
    const children = await repo.find({ where: { parent: { id: cur.id } as any } });
    for (const ch of children) {
      ids.push(ch.id);
      stack.push(ch);
    }
  }
  return ids;
}

/** --admin: 시드에서 만든 관리자 1계정 삭제 */
async function deleteSeedAdmin(usersService: UsersService) {
  const email = process.env.ADMIN_EMAIL ?? 'test@test.com';
  const admin = await usersService.findAdminUser();
  if (!admin) return;
  if (admin.email !== email) return;
  await usersService.deleteUser(admin.id);
  report.adminDeleted = true;
}

async function bootstrap() {
  console.log('Seed Down start');
  const args = parseArgs(process.argv);
  if (!args.all && !args.category && !args.posts && !args.admin) {
    console.log('usage: npm run seed:down -- [--all] [--category] [--posts] [--admin]');
    process.exit(0);
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['warn', 'error'] });
  const ds = app.get<DataSource>(getDataSourceToken());
  const catRepo = ds.getRepository(Category);
  const postRepo = ds.getRepository(Post);
  const commentRepo = ds.getRepository(Comment);
  const usersService = app.get(UsersService);

  try {
    // 우선순위: 포스트 → 카테고리 → 관리자
    if (args.all || args.posts) {
      const postsDir = path.join(SEED_ROOT, 'posts');
      await deletePostsFromMarkdownDir(postRepo, catRepo, usersService, postsDir);
    }

    if (args.all || args.category) {
      await deleteCategoriesFromJson(catRepo, postRepo, commentRepo);
    }

    if (args.all || args.admin) {
      await deleteSeedAdmin(usersService);
    }
  } finally {
    await app.close();
  }

  console.log('Seed Down Summary');
  console.log(`- posts deleted: ${report.postsDeleted}`);
  console.log(`- categories deleted: ${report.categoriesDeleted}`);
  console.log(`- admin deleted: ${report.adminDeleted ? 'yes' : 'no'}`);
  console.log('Seed Down done');
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
