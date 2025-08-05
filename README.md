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
