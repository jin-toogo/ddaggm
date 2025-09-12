import { NextRequest, NextResponse } from "next/server";

// JWT 세션 확인 함수 (현재 사용하지 않음 - Edge Runtime 호환성 문제)
// function getJWTSessionFromRequest(request: NextRequest) { ... }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트 보안 헤더 추가
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // CORS 헤더 설정
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NEXTAUTH_URL || "https://ddaggm.com"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // 보안 헤더 추가
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  }

  // onboarding 페이지 접근 제어는 클라이언트 사이드에서 처리

  // middleware에서 JWT 인증 체크 제거 (Edge Runtime 호환성 문제)
  // 대신 페이지 레벨에서 클라이언트 사이드 인증 처리

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
