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

    // 허용된 이미지 호스트 목록
    const allowedHosts = [
      'pstatic.net', // 네이버
      'coupangcdn.com', // 쿠팡
      'auction.co.kr', // 옥션
      'gmarket.co.kr', // G마켓
      'cafe24img.com', // 카페24
      'via.placeholder.com' // 플레이스홀더
    ];

    const isAllowedHost = allowedHosts.some(host => imageUrl.includes(host));
    if (!isAllowedHost) {
      return Response.json(
        { error: 'Only allowed image hosts are permitted' },
        { status: 403 }
      );
    }

    // 도메인별 적절한 Referer 설정
    let referer = 'https://blog.naver.com/';
    if (imageUrl.includes('gmarket.co.kr')) {
      referer = 'https://www.gmarket.co.kr/';
    } else if (imageUrl.includes('cafe24img.com')) {
      referer = 'https://www.cafe24.com/';
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
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
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시로 단축
        'Vary': 'Referer', // Referer에 따라 캐시 구분
        'ETag': `"${Buffer.from(imageUrl).toString('base64')}"`, // URL 기반 고유 ETag
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