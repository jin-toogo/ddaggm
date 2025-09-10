import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/naver/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "네이버 클라이언트 ID가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  // redirectUrl 파라미터 확인
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl');

  const state = Math.random().toString(36).substring(2, 15);

  const naverAuthURL = new URL("https://nid.naver.com/oauth2.0/authorize");
  naverAuthURL.searchParams.set("response_type", "code");
  naverAuthURL.searchParams.set("client_id", clientId);
  naverAuthURL.searchParams.set("redirect_uri", redirectUri);
  naverAuthURL.searchParams.set("state", state);

  const response = NextResponse.redirect(naverAuthURL.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10분
  });

  // redirectUrl이 있으면 쿠키에 저장
  if (redirectUrl) {
    response.cookies.set("loginRedirectUrl", redirectUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600, // 10분
    });
  }

  return response;
}
