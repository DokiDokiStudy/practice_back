## 초기 카테고리 생성 쿼리

```bash
docker exec -it nestjs_app npm run init
```

# Seed 시스템 개요

## Migration: JSON → 폴더 구조 변환

기존 `categories.json` 구조를 폴더 구조로 자동 변환
- **카테고리 추가가 필요한 경우 categories.json에 폼 맞춰서 추가 필수!**

```bash
# 변환 미리보기 예약어
npm run migrate:categories -- --dry-run --verbose

# 실제 실행
npm run migrate:categories

# 정리된 요약 보기 예약어
npm run migrate:categories -- --verbose
```

### Migration 후 처리
1. `posts/` 폴더의 기존 파일들 확인 및 정리
2. `seed-up-from-folder.ts`로 새로운 구조 테스트

## Seeding
### 폴더 기반 시스템
폴더 구조로 카테고리와 게시글을 동시에 관리하는 새로운 방식

```
categories/
  Docker/
    1장 시작하기 전에/
      1.1-컨테이너가-IT-세상을-점령한-이유.md
      1.2-대상-독자.md
    2장 도커의 기본적인 사용법/
      2.1-컨테이너로-Hello-World-실행하기.md
      2.2-컨테이너란-무엇인가.md
```

#### 폴더 기반 Seed UP

```bash
# 실제 DB 반영
npm run seed:up-folder

# 반영 결과만 출력해보기
npm run seed:up-folder -- --dry-run
```

#### 폴더 기반 Seed Down

```bash
npm run seed:down-folder -- --all            # 모든 데이터 삭제
npm run seed:down-folder -- --posts          # 포스트만 삭제
npm run seed:down-folder -- --category       # 카테고리만 삭제
npm run seed:down-folder -- --admin          # 관리자만 삭제
npm run seed:down-folder -- --keep-essential # 필수 카테고리 보호
npm run seed:down-folder -- --dry-run        # 테스트 실행
```

## 마크다운 파일 생성 규칙

폴더 기반 시스템에서는 폴더 구조가 카테고리 경로를 결정합니다.

### Front Matter 설정

```yaml
---
title: "컨테이너가 IT 세상을 점령한 이유"
categoryPath:
  - "Docker"
  - "1장 시작하기 전에"
  - "1.1 컨테이너가 IT 세상을 점령한 이유"
authorNick: "관리자"
createdAt: "2025-08-10"
updateMode: "upsert"
---
```

### 필드 설명

1. **title(선택)**: 게시글 제목. 없으면 파일명에서 자동 추출
2. **categoryPath(선택)**: 명시적 카테고리 경로. 없으면 폴더 구조 사용
3. **authorNick(선택)**: 작성자 표시용 닉네임. 없으면 관리자 닉네임 사용
4. **createdAt(선택)**: 게시글 생성시각. 파싱 실패 또는 누락 시 DB 기본값 사용
5. **updateMode(선택)**: "upsert"로 명시하면 기존 게시글 업데이트

### 파일명 규칙

- 파일명에서 숫자, 점, 언더스코어, 하이픈 prefix 제거
- 하이픈과 언더스코어를 공백으로 변환
- 예: `1.1-컨테이너가-IT-세상을-점령한-이유.md` → "컨테이너가 IT 세상을 점령한 이유"

### 폴더 구조 -> 카테고리 매핑

```
categories/Docker/1장 시작하기 전에/1.1-컨테이너가-IT-세상을-점령한-이유.md
```

↓

```
카테고리 경로: ["Docker", "1장 시작하기 전에", "1.1 컨테이너가 IT 세상을 점령한 이유"]
```

## 개발 팁

### 새로운 챕터 추가하기

1. categories.json 에서 형식에 맞춰 카테고리 추가
2. `npm run migrate:categories -- --verbose`로 카테고리 구조를 폴더구조로 변경
3. 생성된 .md 파일 내용 작성
4. `npm run seed:up-folder`로 DB 반영

### 기존 게시글 수정하기

1. 해당 마크다운 파일 수정
2. Front Matter에 `updateMode: "upsert"` 추가
3. `npm run seed:up-folder`로 업데이트

### 구조 변경 시

1. 폴더/파일 이동 후
2. `npm run seed:down-folder -- --posts`로 기존 게시글 삭제
3. `npm run seed:up-folder`로 새 구조 반영
