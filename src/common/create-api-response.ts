export function createApiResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
) {
  return {
    statusCode,
    message,
    ...(data && { data }),
  };
}
