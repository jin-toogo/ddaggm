import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createTemporarySession } from "@/lib/temp-session";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

const prisma = new PrismaClient();

interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface NaverUserResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email: string;
    age: string;
    gender: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: "네이버 인증이 취소되었습니다." },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "인증 코드가 필요합니다." },
        { status: 400 }
      );
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRECT; // 환경변수 이름이 오타지만 .env에 맞춤
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/naver/callback`;


    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "네이버 로그인 설정에 문제가 있습니다." },
        { status: 500 }
      );
    }

    // Access Token 요청
    const tokenResponse = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri || "",
      }),
    });

    const tokenResponseText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      console.error("네이버 토큰 교환 실패:", tokenResponse.status);
      return NextResponse.json(
        { error: "토큰 교환에 실패했습니다." },
        { status: 400 }
      );
    }

    let tokenData: NaverTokenResponse;
    try {
      tokenData = JSON.parse(tokenResponseText);

      // 네이버 API는 에러 시 다른 형태로 응답할 수 있음
      if ("error" in tokenData) {
        return NextResponse.json(
          {
            error: `토큰 교환 실패: ${
              (tokenData as any).error_description || (tokenData as any).error
            }`,
          },
          { status: 400 }
        );
      }

      // 필수 필드 검증
      if (!tokenData.access_token) {
        return NextResponse.json(
          { error: "유효하지 않은 토큰 응답입니다." },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("네이버 토큰 응답 파싱 실패:", parseError);
      return NextResponse.json(
        { error: "토큰 응답 파싱에 실패했습니다." },
        { status: 500 }
      );
    }

    // 사용자 정보 요청
    const userResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error("네이버 사용자 정보 조회 실패:", userResponse.status);
      return NextResponse.json(
        { error: "사용자 정보 조회에 실패했습니다." },
        { status: 400 }
      );
    }

    const userData: NaverUserResponse = await userResponse.json();

    if (userData.resultcode !== "00") {
      return NextResponse.json(
        { error: "네이버에서 사용자 정보를 가져올 수 없습니다." },
        { status: 400 }
      );
    }

    const naverUser = userData.response;
    
    // 사용자 기본 정보 추출
    const userName = naverUser.email?.split("@")[0] || "사용자";
    const ageGroup = naverUser.age || undefined;
    const gender = naverUser.gender ? naverUser.gender.toLowerCase() as "m" | "f" : undefined;

    // 기존 사용자 확인 (이미 가입된 경우)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { provider: "naver", providerId: naverUser.id },
          { email: naverUser.email }
        ]
      },
      include: {
        interests: {
          include: {
            category: true,
          },
        },
      },
    });

    if (existingUser) {
      // JWT 토큰 생성
      const accessToken = generateAccessToken({
        userId: existingUser.id.toString(),
        email: existingUser.email,
        provider: existingUser.provider,
        status: existingUser.status,
        tokenVersion: existingUser.tokenVersion,
      });

      const refreshToken = generateRefreshToken({
        userId: existingUser.id.toString(),
        tokenVersion: existingUser.tokenVersion,
      });

      // success 페이지 파라미터 설정  
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || request.url;
      const successUrl = new URL("/auth/success", baseUrl);
      successUrl.searchParams.set("provider", "naver");
      successUrl.searchParams.set("redirectUrl", "/");

      // 기존 사용자 로그인 처리
      const response = NextResponse.redirect(successUrl);
      
      // JWT 토큰을 쿠키에 설정
      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 60, // 30분
        sameSite: "lax",
        path: "/",
      });

      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 14 * 24 * 60 * 60, // 14일
        sameSite: "lax",
        path: "/",
      });

      // 기존 user 쿠키도 호환성을 위해 유지 (일시적)
      const sessionUser = {
        id: existingUser.id.toString(),
        userId: existingUser.id.toString(),
        email: existingUser.email,
        nickname: existingUser.nickname,
        profileImage: existingUser.profileImage || undefined,
        provider: existingUser.provider,
        privacyAgreed: existingUser.privacyAgreed,
      };

      response.cookies.set("user", JSON.stringify(sessionUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7일
        sameSite: "lax",
      });

      return response;
    }

    // 새 사용자 - 임시 세션 생성
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || request.url;
    const response = NextResponse.redirect(new URL("/onboarding/profile", baseUrl));
    
    createTemporarySession(response, {
      provider: "naver",
      providerId: naverUser.id,
      email: naverUser.email,
      nickname: userName,
      ageGroup,
      gender,
    });


    return response;
  } catch (error) {
    console.error("네이버 로그인 처리 오류:", error);
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || request.url;
    return NextResponse.redirect(
      new URL(
        "/auth/error?message=네이버 로그인 처리 중 오류가 발생했습니다",
        baseUrl
      )
    );
  }
}
