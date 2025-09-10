import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

// Node.js 런타임 사용으로 crypto 모듈 지원
export const runtime = "nodejs";

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

  // 보호된 경로 인증 확인 (/onboarding은 제외 - 신규 사용자 접근 허용)
  const protectedPaths = ["/profile"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const session = getSessionFromRequest(request);
    const hasUserCookie = request.cookies.has("user");

    if (!session) {
      // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 개인정보 동의가 필요한 사용자는 온보딩으로 리다이렉트
    if (!session.privacyAgreed && !pathname.startsWith("/onboarding")) {
      const onboardingUrl = new URL("/onboarding/interests", request.url);
      // 원래 가려던 페이지를 기억하기 위해 callbackUrl 추가
      onboardingUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/profile/:path*", "/onboarding/:path*"],
};
