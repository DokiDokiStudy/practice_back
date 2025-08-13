## 초기 카테고리 생성 쿼리

```bash
docker exec -it nestjs_app npm run
```

## 응답값(ApiResponse) 방식 사용

대부분의 응답은 응답Dto(ApiOkResponse) 설계후 사용 권고,
에러메세지와같이 굳이 Dto가 필요없다고 생각될때에만 ApiResponse이용

## like table

like가 예약어여서 테이블 마이그레이션 관련된 오류가 있는 것 같음 방법을 찾아봐야할 것 같음
임시 조치로 like -> likes 수정

```bash
@ApiOkResponse({ description: '성공', type: LoginResponseDto })
@ApiResponse(
  {
    status: 401,
    description: '인증 실패',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  }
)
```

## Seed UP 하기!
### 실제 DB 반영
```bash
npm run seed:up
```
### 반영 결과만 출력해보기
```bash
npm run seed:up -- --dry-run
```

## Seed Down
```bash
npm run seed:down -- --all
npm run seed:down -- --category
npm run seed:down -- --posts
npm run seed:down -- --admin
```

## .md 파일 생성 규칙
* --- <=> --- 사이에 있는 meta data를 기준으로 데이터 생성
1. title(필수) : 게시글 제목
2. categoryPath(필수) : 대 -> 중 -> 소 카테고리의 전체 경로 배열 필요
3. authorNick(선택): 작성자 표시용 닉네임. 없으면 관리자 닉네임 사용
4. createdAt(선택): 게시글 생성시각. 파싱 실패 또는 누락 시 DB 기본값 사용
5. updateMode: "upsert"로 명시하면 upsert를 실행하게 됨
  - 없거나 다른 값이면 항상 insert

* 본문은 그대로 마크다운(raw) 으로 DB에 저장 - 본문은 참고로 upsert임

### 마크다운 게시글 입력 로직
 - posts/*.md를 순회 → front matter 파싱 → categoryPath로 카테고리 찾기
 - 동일 (제목, 카테고리) 조합이 이미 존재하면 스킵, 없으면 생성
   - 작성자: authorNick 있으면 사용, 없으면 관리자 닉네임
   - 시간: createdAt 있으면 파싱하여 사용