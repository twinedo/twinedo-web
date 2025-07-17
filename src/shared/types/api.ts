export type ApiSuccessResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  status: number;
  message: string; // Combined error message (can include both message and error details)
  details?: unknown; // Optional for additional error details
};