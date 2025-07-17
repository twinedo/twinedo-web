export function formatError(error: unknown): {
  message: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    return { 
      message: error.message,
      details: import.meta.env.NODE_ENV === 'development' ? error.stack : undefined 
    };
  }
  return { 
    message: String(error),
    details: error 
  };
}