import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function createApiResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
  dtoClass?: new () => T, // Optional DTO class for transformation
) {
  let transformedData: T | undefined = data;

  // data와 dtoClass가 모두 제공된 경우에만 변환 및 검증 수행
  if (data && dtoClass) {
    transformedData = plainToInstance(dtoClass, data);

    // ISSUE #20: Class-validator 검증 로직으로 인한 API 응답 문제 해결
    if (data && dtoClass) {
      transformedData = plainToInstance(dtoClass, data);
    }
  }

  return {
    statusCode,
    message,
    ...(data && {
      data: dtoClass ? plainToInstance(dtoClass, data) : data,
    }),
  };
}
