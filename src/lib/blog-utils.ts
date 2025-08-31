/**
 * 네이버 블로그 URL에서 블로그 ID를 추출하는 함수
 */
export function extractNaverBlogId(blogUrl: string): string | null {
  if (!blogUrl) return null;
  
  try {
    // URL 정규화 (http/https 처리)
    const normalizedUrl = blogUrl.startsWith('http') ? blogUrl : `https://${blogUrl}`;
    const url = new URL(normalizedUrl);
    
    // blog.naver.com 도메인 확인
    if (!url.hostname.includes('naver.com')) {
      return null;
    }
    
    // 경로에서 블로그 ID 추출
    const pathMatch = url.pathname.match(/^\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting blog ID:', error);
    return null;
  }
}

/**
 * 네이버 블로그 ID를 RSS URL로 변환하는 함수
 */
export function getBlogRssUrl(blogId: string): string {
  return `https://rss.blog.naver.com/${blogId}.xml`;
}