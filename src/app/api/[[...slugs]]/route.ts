// Important: declare runtime here (do not rely on re-exports for this)
export const runtime = 'nodejs' as const;
export const dynamic = 'force-dynamic';
export { GET, POST, PATCH, DELETE, PUT } from '@/backend';