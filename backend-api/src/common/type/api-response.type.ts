export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;
}

export type ApiErrorResponse = Omit<ApiResponse, 'data'> & {
  error: string;
  errorCode?: string;
  details?: Record<string, any>;
};
