import { MetadataRoute } from 'next'

// 정적 사이트맵이 생성되면 그것을 우선 사용하고,
// 없으면 기본 사이트맵 반환
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ddaggm.com'
  
  // 기본 fallback 사이트맵 (정적 파일이 없을 때만 사용)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}