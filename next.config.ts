import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // 정적 파일 우선 처리
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml', // public/sitemap.xml이 우선 제공됨
      },
    ];
  },
};

export default nextConfig;
