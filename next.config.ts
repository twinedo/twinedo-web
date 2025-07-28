import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  target: "serverless",
  serverRuntimeConfig: {
    PROJECTS_UPLOAD_DIR: path.join(process.cwd(), 'src', 'backend', 'src', 'uploads', 'projects'),
    CV_UPLOAD_DIR: path.join(process.cwd(), 'src', 'backend', 'src', 'uploads', 'cv')
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api',
      },
    ]
  },
};

export default nextConfig;
