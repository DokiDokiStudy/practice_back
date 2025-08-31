import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DataSource, Repository, In, IsNull } from 'typeorm';
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
const ESSENTIAL_ROOTS = new Set(['공지사항', '자유게시판', 'Docker']);

type PostMeta = {
  title?: string;
  categoryPath?: string[];
  authorNick?: string;
  createdAt?: string;
  updateMode?: string;
};

type Args = {
  all: boolean;
  category: boolean;
  posts: boolean;
  admin: boolean;
  keepEssential: boolean;
  dryRun: boolean;
};

const report = {
  postsDeleted: 0,
  categoriesDeleted: 0,
  adminDeleted: false,
  essentialCategoriesKept: [] as string[],
  deletedPosts: [] as string[],
  deletedCategories: [] as string[],
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
    all: flags.has('all') || !!process.env.SEED_DOWN_ALL,
    category: flags.has('category') || !!process.env.SEED_DOWN_CATEGORY,
    posts: flags.has('posts') || !!process.env.SEED_DOWN_POSTS,
    admin: flags.has('admin') || !!process.env.SEED_DOWN_ADMIN,
    keepEssential:
      flags.has('keep-essential') || !!process.env.SEED_KEEP_ESSENTIAL,
    dryRun: flags.has('dry-run') || !!process.env.SEED_DRY_RUN,
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
    : repo.findOne({ where: { name, parent: IsNull() } });
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
  commentRepo: Repository<Comment>,
  rootDir: string,
  dryRun: boolean,
) {
  console.log(`🔍 Starting post deletion scan from: ${rootDir}`);

  // 먼저 디렉토리 존재 확인
  try {
    await fs.access(rootDir);
    console.log(`✅ Root directory exists: ${rootDir}`);
  } catch (error) {
    console.error(`❌ Root directory not found: ${rootDir}`);
    return;
  }

  const walk = async (dir: string, categoryPath: string[]) => {
    console.log(`📁 Scanning directory: ${dir}`);
    console.log(`📍 Current category path: [${categoryPath.join(' > ')}]`);

    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
      console.log(`📄 Found ${entries.length} entries in ${dir}`);
    } catch (error) {
      console.warn(`❌ Cannot read directory ${dir}:`, error.message);
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        console.log(`⏭️ Skipping hidden file: ${entry.name}`);
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      console.log(`🔍 Processing entry: ${entry.name}`);

      if (entry.isDirectory()) {
        console.log(`📂 Entering subdirectory: ${entry.name}`);
        await walk(fullPath, [...categoryPath, entry.name]);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith('.md')) {
        console.log(`⏭️ Skipping non-markdown file: ${entry.name}`);
        continue;
      }

      console.log(`📝 Processing markdown file: ${entry.name}`);

      try {
        const raw = await fs.readFile(fullPath, 'utf-8');
        let meta: PostMeta = {};

        try {
          const parsed = matter(raw);
          meta = (parsed.data || {}) as PostMeta;
          console.log(`📋 Parsed frontmatter:`, meta);
        } catch {
          console.log(`⚠️ No frontmatter or parsing failed`);
        }

        const finalCategoryPath =
          Array.isArray(meta.categoryPath) && meta.categoryPath.length > 0
            ? meta.categoryPath
            : categoryPath;

        console.log(
          `🗂️ Final category path: [${finalCategoryPath.join(' > ')}]`,
        );

        if (finalCategoryPath.length === 0) {
          console.log(`⏭️ Skipping file at root level: ${entry.name}`);
          continue;
        }

        console.log(
          `🔍 Looking for category with path: ${finalCategoryPath.join(' > ')}`,
        );
        const category = await findCategoryByPath(catRepo, finalCategoryPath);
        if (!category) {
          console.log(
            `❌ Category not found for path: ${finalCategoryPath.join(' > ')}`,
          );
          continue;
        }
        console.log(`✅ Found category: ${category.name} (ID: ${category.id})`);

        const title = meta.title?.trim() || deriveTitle(entry.name);
        if (!title) {
          console.log(`❌ No title derived from file: ${entry.name}`);
          continue;
        }
        console.log(`📰 Looking for posts with title: "${title}"`);

        const posts = await postRepo.find({
          where: { title, category: { id: category.id } as any },
          relations: ['category'],
        });

        console.log(
          `📊 Found ${posts.length} posts with title "${title}" in category "${category.name}"`,
        );

        if (posts.length > 0) {
          const pathLabel = `[${finalCategoryPath.join(' > ')}] ${title}`;
          console.log(
            `🗑️ ${dryRun ? 'Would delete' : 'Deleting'} post: ${pathLabel}`,
          );

          if (!dryRun) {
            const postIds = posts.map((p) => p.id);
            console.log(
              `🗑️ Deleting ${postIds.length} posts with IDs: ${postIds.join(', ')}`,
            );

            // 댓글 먼저 삭제
            const commentResult = await commentRepo.delete({
              post: In(postIds) as any,
            });
            console.log(`🗑️ Deleted ${commentResult.affected || 0} comments`);

            // 포스트 삭제
            const postResult = await postRepo.delete({
              id: In(postIds) as any,
            });
            console.log(`🗑️ Deleted ${postResult.affected || 0} posts`);
          }

          report.postsDeleted += posts.length;
          report.deletedPosts.push(pathLabel);
        } else {
          console.log(
            `⚠️ No posts found with title "${title}" in category "${category.name}"`,
          );
        }
      } catch (error) {
        console.error(`❌ Error processing file ${fullPath}:`, error);
      }
    }
  };

  await walk(rootDir, []);
  console.log(`🏁 Post deletion scan completed`);
}

/** 폴더 구조 기반 카테고리 삭제 (깊은 경로부터) */
async function deleteCategoriesFromFolderStructure(
  catRepo: Repository<Category>,
  postRepo: Repository<Post>,
  commentRepo: Repository<Comment>,
  rootDir: string,
  keepEssential: boolean,
  dryRun: boolean,
) {
  console.log(`🔍 Scanning for categories to delete from: ${rootDir}`);

  const categoryPaths = new Set<string>();

  const walkDirs = async (dir: string, categoryPath: string[]) => {
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      console.warn(`❌ Cannot read directory ${dir}:`, error.message);
      return;
    }

    if (categoryPath.length > 0) {
      categoryPaths.add(categoryPath.join('|||'));
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        await walkDirs(path.join(dir, entry.name), [
          ...categoryPath,
          entry.name,
        ]);
      }
    }
  };

  try {
    await fs.access(rootDir);
    await walkDirs(rootDir, []);
  } catch (error) {
    console.warn(`⚠️ Root directory not found: ${rootDir}`);
    return;
  }

  // 깊은 경로부터 삭제 (자식부터 부모 순서)
  const orderedPaths = Array.from(categoryPaths)
    .map((x) => x.split('|||'))
    .sort((a, b) => b.length - a.length);

  for (const pathNames of orderedPaths) {
    const category = await findCategoryByPath(catRepo, pathNames);
    if (!category) continue;

    // 필수 카테고리 보호
    if (
      keepEssential &&
      ESSENTIAL_ROOTS.has(category.name) &&
      pathNames.length === 1
    ) {
      console.log(`🛡️ Keeping essential category: ${category.name}`);
      report.essentialCategoriesKept.push(category.name);
      continue;
    }

    const pathLabel = pathNames.join(' > ');
    console.log(`🗑️ Deleting category: ${pathLabel}`);

    if (!dryRun) {
      // 해당 카테고리와 모든 하위 카테고리의 포스트/댓글 삭제
      const subtreeIds = await collectDescendantIds(catRepo, category);
      if (subtreeIds.length > 0) {
        const posts = await postRepo.find({
          where: { category: In(subtreeIds) as any },
          select: ['id'],
        });
        const postIds = posts.map((p) => p.id);
        if (postIds.length > 0) {
          await commentRepo.delete({ post: In(postIds) as any });
          await postRepo.delete({ id: In(postIds) as any });
        }
      }

      // 카테고리 삭제
      await catRepo.delete({ id: category.id });
    }

    report.categoriesDeleted += 1;
    report.deletedCategories.push(pathLabel);
  }
}

async function collectDescendantIds(
  repo: Repository<Category>,
  root: Category,
): Promise<number[]> {
  const ids = [root.id];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = await repo.find({
      where: { parent: { id: current.id } as any },
    });

    for (const child of children) {
      ids.push(child.id);
      stack.push(child);
    }
  }

  return ids;
}

async function deleteSeedAdmin(usersService: UsersService, dryRun: boolean) {
  const email = process.env.ADMIN_EMAIL ?? 'test@naver.com';

  try {
    const admin = await usersService.findAdminUser();
    if (!admin) {
      console.log(`⚠️ No admin user found`);
      return;
    }

    if (admin.email !== email) {
      console.log(
        `⚠️ Admin email mismatch: found ${admin.email}, expected ${email}`,
      );
      return;
    }

    console.log(`🗑️ Deleting admin user: ${admin.email}`);

    if (!dryRun) {
      await usersService.deleteUser(admin.id);
    }

    report.adminDeleted = true;
  } catch (error) {
    console.error(`❌ Error deleting admin user:`, error);
  }
}

function printSummary(args: Args) {
  const sep = '----------------------------------------';
  console.log('\n[Folder-based Seed Down Summary]');
  console.log(sep);

  console.log(`🗑️ 삭제된 게시글: ${report.postsDeleted}개`);
  if (report.deletedPosts.length > 0) {
    report.deletedPosts.forEach((post) => console.log(`    - ${post}`));
  }

  console.log(`🗑️ 삭제된 카테고리: ${report.categoriesDeleted}개`);
  if (report.deletedCategories.length > 0) {
    report.deletedCategories.forEach((cat) => console.log(`    - ${cat}`));
  }

  if (report.essentialCategoriesKept.length > 0) {
    console.log(
      `🛡️ 보호된 필수 카테고리: ${report.essentialCategoriesKept.join(', ')}`,
    );
  }

  console.log(`👤 관리자 계정 삭제: ${report.adminDeleted ? '✅' : '❌'}`);

  console.log(sep);
  console.log(
    `실행 모드: ${args.dryRun ? 'Dry-run (실제 삭제 없음)' : '실제 삭제 수행'}`,
  );
  console.log(`필수 카테고리 보호: ${args.keepEssential ? '✅' : '❌'}`);
  console.log(sep);
}

async function bootstrap() {
  const args = parseArgs(process.argv);

  console.log(
    '🧹 Folder-based Seed Down start',
    args.dryRun ? '(dry-run)' : '',
  );

  if (!args.all && !args.category && !args.posts && !args.admin) {
    console.log('사용법:');
    console.log(
      '  npm run seed:down:folder -- --all              # 모든 데이터 삭제',
    );
    console.log(
      '  npm run seed:down:folder -- --posts            # 포스트만 삭제',
    );
    console.log(
      '  npm run seed:down:folder -- --category         # 카테고리만 삭제',
    );
    console.log(
      '  npm run seed:down:folder -- --admin            # 관리자만 삭제',
    );
    console.log(
      '  npm run seed:down:folder -- --keep-essential   # 필수 카테고리 보호',
    );
    console.log(
      '  npm run seed:down:folder -- --dry-run          # 테스트 실행',
    );
    process.exit(0);
  }

  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['warn', 'error'],
    });

    const ds = app.get(DataSource);
    const catRepo = ds.getRepository(Category);
    const postRepo = ds.getRepository(Post);
    const commentRepo = ds.getRepository(Comment);
    const usersService = app.get(UsersService);

    if (args.all || args.posts) {
      await deletePostsFromFolderStructure(
        postRepo,
        catRepo,
        commentRepo,
        FOLDER_ROOT,
        args.dryRun,
      );
    }

    if (args.all || args.category) {
      await deleteCategoriesFromFolderStructure(
        catRepo,
        postRepo,
        commentRepo,
        FOLDER_ROOT,
        args.keepEssential,
        args.dryRun,
      );
    }

    if (args.all || args.admin) {
      await deleteSeedAdmin(usersService, args.dryRun);
    }

    printSummary(args);
    console.log('🧹 Folder-based Seed Down done');
  } catch (error) {
    console.error('❌ Seed down operation failed:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

bootstrap().catch((e) => {
  console.error('❌ Bootstrap failed:', e);
  process.exit(1);
});
