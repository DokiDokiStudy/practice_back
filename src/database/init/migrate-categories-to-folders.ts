import { promises as fs } from 'fs';
import * as path from 'path';

type CategoryNode = { 
  name: string; 
  children?: CategoryNode[] 
};

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SEED_ROOT = path.join(PROJECT_ROOT, 'src', 'database', 'seed');
const CATEGORIES_JSON_PATH = path.join(SEED_ROOT, 'categories.json');
const CATEGORIES_FOLDER_PATH = path.join(SEED_ROOT, 'categories');
const POSTS_FOLDER_PATH = path.join(SEED_ROOT, 'posts');

type Args = {
  dryRun: boolean;
  verbose: boolean;
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
    dryRun: flags.has('dry-run') || !!process.env.MIGRATE_DRY_RUN,
    verbose: flags.has('verbose') || !!process.env.MIGRATE_VERBOSE,
  };
}

const report = {
  foldersCreated: [] as string[],
  filesCreated: [] as string[],
  filesMoved: [] as string[],
  filesSkipped: [] as string[],
  errors: [] as string[],
};

function sanitizeFolderName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')  // 특수문자를 하이픈으로
    .replace(/\s+/g, ' ')           // 연속된 공백을 하나로
    .trim();
}

function deriveMarkdownFileName(categoryName: string): string {
  // 카테고리명 기반으로 마크다운 파일명 생성
  // "1.1 컨테이너가 IT 세상을 점령한 이유" -> "1.1-컨테이너가-IT-세상을-점령한-이유.md"
  return categoryName
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim() + '.md';
}

async function ensureDirectory(dirPath: string, dryRun: boolean): Promise<void> {
  try {
    await fs.access(dirPath);
    // 디렉토리가 이미 존재하면 아무것도 하지 않음
  } catch {
    // 디렉토리가 없으면 생성
    if (!dryRun) {
      await fs.mkdir(dirPath, { recursive: true });
    }
    report.foldersCreated.push(dirPath);
  }
}

// TODO : 추후에 posts/ 하위 파일 같은 거 있는지 검사하는 로직 필요없긴함~
async function findAndMoveExistingPost(
  categoryPath: string[],
  categoryName: string,
  targetFolderPath: string,
  dryRun: boolean
): Promise<void> {
  const expectedFileName = deriveMarkdownFileName(categoryName);
  const existingPostPath = path.join(POSTS_FOLDER_PATH, expectedFileName);
  const targetFilePath = path.join(targetFolderPath, expectedFileName);

  // 먼저 타겟 파일이 이미 존재하는지 확인
  try {
    await fs.access(targetFilePath);
    // 타겟 파일이 이미 존재하면 건드리지 않음
    const pathLabel = `[${categoryPath.join(' > ')}] ${categoryName}`;
    report.filesSkipped.push(pathLabel);
    return;
  } catch {
    // 타겟 파일이 없으면 계속 진행
  }

  try {
    await fs.access(existingPostPath);
    // posts/ 폴더에 기존 파일이 존재하면 이동
    
    if (!dryRun) {
      await fs.copyFile(existingPostPath, targetFilePath);
      // 원본 파일은 백업용으로 남겨둠 (필요시 수동 삭제)
    }
    
    report.filesMoved.push(`${existingPostPath} -> ${targetFilePath}`);
  } catch {
    // 기존 파일이 없으면 새로 생성
    const templateContent = createMarkdownTemplate(categoryPath, categoryName);
    
    if (!dryRun) {
      await fs.writeFile(targetFilePath, templateContent, 'utf-8');
    }
    
    report.filesCreated.push(targetFilePath);
  }
}

function createMarkdownTemplate(categoryPath: string[], categoryName: string): string {
  const fullPath = [...categoryPath, categoryName];
  
  return `---
title: "${categoryName}"
categoryPath:
${fullPath.map(p => `  - "${p}"`).join('\n')}
authorNick: "관리자"
createdAt: "${new Date().toISOString().split('T')[0]}"
updateMode: "upsert"
---

# ${categoryName}

이곳에 ${categoryName}에 대한 내용을 작성해주세요.

## 개요

<!-- 내용을 작성해주세요 -->

## 상세 내용

<!-- 내용을 작성해주세요 -->

> 이 문서는 자동 생성된 템플릿입니다. 실제 내용으로 교체해주세요.
`;
}

async function processCategory(
  node: CategoryNode,
  parentPath: string[],
  baseFolderPath: string,
  dryRun: boolean,
  verbose: boolean
): Promise<void> {
  const currentPath = [...parentPath, node.name];
  
  if (verbose) {
    console.log(`Processing: ${currentPath.join(' > ')}`);
  }

  if (node.children && node.children.length > 0) {
    // 중간 카테고리: 폴더 생성 후 하위 카테고리들을 처리
    const sanitizedName = sanitizeFolderName(node.name);
    const currentFolderPath = path.join(baseFolderPath, sanitizedName);
    
    await ensureDirectory(currentFolderPath, dryRun);

    for (const child of node.children) {
      await processCategory(child, currentPath, currentFolderPath, dryRun, verbose);
    }
  } else {
    // 소 카테고리: 마크다운 파일 생성/이동
    // 현재 baseFolderPath에 직접 파일 생성
    await findAndMoveExistingPost(parentPath, node.name, baseFolderPath, dryRun);
  }
}

async function readCategoriesJson(): Promise<CategoryNode> {
  const content = await fs.readFile(CATEGORIES_JSON_PATH, 'utf-8');
  return JSON.parse(content) as CategoryNode;
}

// 
function printSummary(args: Args) {
  const sep = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  console.log('\n Categories Migration Summary');
  console.log(sep);

  console.log(`폴더 생성: ${report.foldersCreated.length}개`);
  if (report.foldersCreated.length > 0 && args.verbose) {
    report.foldersCreated.forEach(folder => 
      console.log(`   ${folder.replace(CATEGORIES_FOLDER_PATH, '.')}`)
    );
  }

  console.log(`새 파일 생성: ${report.filesCreated.length}개`);
  if (report.filesCreated.length > 0 && args.verbose) {
    report.filesCreated.forEach(file => 
      console.log(`   ${file.replace(CATEGORIES_FOLDER_PATH, '.')}`)
    );
  }

  console.log(`파일 이동: ${report.filesMoved.length}개`);
  if (report.filesMoved.length > 0 && args.verbose) {
    report.filesMoved.forEach(move => 
      console.log(`   ${move}`)
    );
  }

  console.log(`스킵된 파일: ${report.filesSkipped.length}개`);
  if (report.filesSkipped.length > 0 && args.verbose) {
    report.filesSkipped.forEach(file => 
      console.log(`   ${file}`)
    );
  }

  if (report.errors.length > 0) {
    console.log(`에러: ${report.errors.length}개`);
    report.errors.forEach(error => console.log(`   ${error}`));
  }

  console.log(sep);
  console.log(`실행 모드: ${args.dryRun ? 'Dry-run (실제 변경 없음)' : '실제 변경 수행'}`);
  console.log(`소스: ${CATEGORIES_JSON_PATH}`);
  console.log(`대상: ${CATEGORIES_FOLDER_PATH}`);
  console.log(sep);
}

async function bootstrap() {
  const args = parseArgs(process.argv);
  
  console.log('Categories to Folders Migration Start', args.dryRun ? '(dry-run)' : '');
  
  try {
    // categories.json 읽기
    const rootCategory = await readCategoriesJson();
    console.log(`Found root category: ${rootCategory.name}`);
    
    if (!rootCategory.children || rootCategory.children.length === 0) {
      console.log('No children categories found in categories.json');
      return;
    }

    // 루트 카테고리 폴더 생성 (Docker)
    const rootFolderPath = path.join(CATEGORIES_FOLDER_PATH, sanitizeFolderName(rootCategory.name));
    await ensureDirectory(rootFolderPath, args.dryRun);

    // 모든 하위 카테고리 처리
    for (const chapter of rootCategory.children) {
      await processCategory(chapter, [rootCategory.name], rootFolderPath, args.dryRun, args.verbose);
    }

    printSummary(args);
    console.log('Categories to Folders Migration Complete! \n\n');
  } catch (error) {
    console.error('Migration failed:', error);
    report.errors.push(error.message);
    process.exit(1);
  }
}

bootstrap().catch((e) => {
  console.error('Bootstrap failed:', e);
  process.exit(1);
});
