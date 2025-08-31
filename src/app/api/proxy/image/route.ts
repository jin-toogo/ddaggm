export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return Response.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // 네이버 이미지 URL만 허용
    if (!imageUrl.includes('pstatic.net')) {
      return Response.json(
        { error: 'Only Naver images are allowed' },
        { status: 403 }
      );
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://blog.naver.com/',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24시간 캐시
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}