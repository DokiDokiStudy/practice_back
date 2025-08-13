import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';
import matter = require('gray-matter');

import { Category } from 'src/categories/entities/category.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { UsersService } from 'src/users/users.service';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SEED_ROOT = path.join(PROJECT_ROOT, 'src', 'database', 'seed');
const FOLDER_ROOT = path.join(SEED_ROOT, 'categories');

type PostMeta = {
  title?: string;
  categoryPath?: string[];
};

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
    : repo.findOne({ where: { name, parent: null } });
}

async function findCategoryByPath(
  repo: Repository<Category>,
  pathNames: string[],
) {
  let parent: Category | null = null;
  for (const name of pathNames) {
    const found = await findByParentAndName(repo, parent, name);
    if (!found) return null;
    parent = found;
  }
  return parent;
}

function deriveTitle(fileName: string): string {
  const base = fileName.replace(/\.md$/i, '');
  const stripped = base.replace(/^[\d._-]+\s*/, '');
  return stripped.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** 폴더 구조 기반 포스트 삭제 */
async function deletePostsFromFolderStructure(
  postRepo: Repository<Post>,
  catRepo: Repository<Category>,
  rootDir: string,
) {
  const walk = async (dir: string, relParts: string[]) => {
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full, [...relParts, e.name]);
        continue;
      }
      if (!e.isFile() || !e.name.endsWith('.md')) continue;

      const raw = await fs.readFile(full, 'utf-8');
      let meta: PostMeta = {};
      try {
        const parsed = matter(raw);
        meta = (parsed.data || {}) as PostMeta;
      } catch {}
      const categoryPath =
        Array.isArray(meta.categoryPath) && meta.categoryPath.length
          ? meta.categoryPath
          : relParts;
      if (!categoryPath.length) continue;

      const cat = await findCategoryByPath(catRepo, categoryPath);
      if (!cat) continue;

      const title = meta.title?.trim() || deriveTitle(e.name);
      if (!title) continue;

      const posts = await postRepo.find({
        where: { title, category: { id: cat.id } as any },
        select: ['id'],
      });
      if (posts.length) {
        await postRepo.delete(posts.map((p) => p.id));
        report.postsDeleted += posts.length;
      }
    }
  };
  await walk(rootDir, []);
}

/** 폴더 구조 기반 카테고리 삭제 (깊은 경로부터) */
async function deleteCategoriesFromFolderStructure(
  catRepo: Repository<Category>,
  postRepo: Repository<Post>,
  commentRepo: Repository<Comment>,
  rootDir: string,
) {
  const dirPaths = new Set<string>(); // 'A|||B|||C'
  const walkDirs = async (dir: string, relParts: string[]) => {
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    if (relParts.length) dirPaths.add(relParts.join('|||'));
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      if (e.isDirectory()) {
        await walkDirs(path.join(dir, e.name), [...relParts, e.name]);
      }
    }
  };
  await walkDirs(rootDir, []);

  const ordered = Array.from(dirPaths)
    .map((x) => x.split('|||'))
    .sort((a, b) => b.length - a.length);

  for (const pathNames of ordered) {
    const cat = await findCategoryByPath(catRepo, pathNames);
    if (!cat) continue;

    // 서브트리 모든 카테고리 id
    const subtreeIds = await collectDescendantIds(catRepo, cat);
    if (subtreeIds.length) {
      const posts = await postRepo.find({
        where: { category: In(subtreeIds) as any },
        select: ['id'],
      });
      const postIds = posts.map((p) => p.id);
      if (postIds.length) {
        await commentRepo.delete({ post: In(postIds) as any });
        await postRepo.delete({ id: In(postIds) as any });
      }
    }
    const target = await catRepo.findOne({ where: { id: cat.id } });
    if (target) {
      await catRepo.remove(target);
      report.categoriesDeleted += 1;
    }
  }
}

async function collectDescendantIds(
  repo: Repository<Category>,
  root: Category,
) {
  const ids = [root.id];
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop()!;
    const children = await repo.find({
      where: { parent: { id: cur.id } as any },
    });
    for (const ch of children) {
      ids.push(ch.id);
      stack.push(ch);
    }
  }
  return ids;
}

async function deleteSeedAdmin(usersService: UsersService) {
  const email = process.env.ADMIN_EMAIL ?? 'test@test.com';
  const admin = await usersService.findAdminUser();
  if (!admin) return;
  if (admin.email !== email) return;
  await usersService.deleteUser(admin.id);
  report.adminDeleted = true;
}

async function bootstrap() {
  console.log('Folder Seed Down start');
  const args = parseArgs(process.argv);
  if (!args.all && !args.category && !args.posts && !args.admin) {
    console.log(
      'usage: npm run seed:down:folder -- [--all] [--category] [--posts] [--admin]',
    );
    process.exit(0);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });
  const ds = app.get<DataSource>(getDataSourceToken());
  const catRepo = ds.getRepository(Category);
  const postRepo = ds.getRepository(Post);
  const commentRepo = ds.getRepository(Comment);
  const usersService = app.get(UsersService);

  try {
    if (args.all || args.posts) {
      await deletePostsFromFolderStructure(postRepo, catRepo, FOLDER_ROOT);
    }
    if (args.all || args.category) {
      await deleteCategoriesFromFolderStructure(
        catRepo,
        postRepo,
        commentRepo,
        FOLDER_ROOT,
      );
    }
    if (args.all || args.admin) {
      await deleteSeedAdmin(usersService);
    }
  } finally {
    await app.close();
  }

  console.log('Folder Seed Down Summary');
  console.log(`- posts deleted: ${report.postsDeleted}`);
  console.log(`- categories deleted: ${report.categoriesDeleted}`);
  console.log(`- admin deleted: ${report.adminDeleted ? 'yes' : 'no'}`);
  console.log('Folder Seed Down done');
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
