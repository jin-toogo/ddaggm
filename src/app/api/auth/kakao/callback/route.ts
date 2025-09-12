import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createTemporarySession } from "@/lib/temp-session";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

const prisma = new PrismaClient();

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    has_email?: boolean;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // 5. 새 사용자 - 임시 세션 생성
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      request.url;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: "카카오 인증이 취소되었습니다." },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "인증 코드가 필요합니다." },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    if (!clientId) {
      return NextResponse.json(
        { error: "카카오 로그인 설정에 문제가 있습니다." },
        { status: 500 }
      );
    }

    // 1. 토큰 교환
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri || "",
        code,
      }),
    });

    const tokenResponseText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      console.error("카카오 토큰 교환 실패:", tokenResponse.status);
      return NextResponse.json(
        { error: "토큰 교환에 실패했습니다." },
        { status: 400 }
      );
    }

    let tokenData: KakaoTokenResponse;
    try {
      tokenData = JSON.parse(tokenResponseText);

      // 카카오 API 에러 응답 처리
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

      if (!tokenData.access_token) {
        return NextResponse.json(
          { error: "유효하지 않은 토큰 응답입니다." },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("카카오 토큰 응답 파싱 실패:", parseError);
      return NextResponse.json(
        { error: "토큰 응답 파싱에 실패했습니다." },
        { status: 500 }
      );
    }

    // 2. 사용자 정보 조회
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!userResponse.ok) {
      console.error("카카오 사용자 정보 조회 실패:", userResponse.status);
      return NextResponse.json(
        { error: "사용자 정보 조회에 실패했습니다." },
        { status: 400 }
      );
    }

    const userData: KakaoUserInfo = await userResponse.json();

    // 3. OAuth 사용자 데이터 추출
    const kakaoId = userData.id.toString();
    const email = userData.kakao_account?.email || "";
    const nickname =
      userData.kakao_account?.profile?.nickname ||
      userData.properties?.nickname ||
      email.split("@")[0] ||
      "사용자";

    // 4. 기존 사용자 확인 (이미 가입된 경우)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ provider: "kakao", providerId: kakaoId }, { email: email }],
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

      const redirectUrl = existingUser.privacyAgreed
        ? new URL("/", baseUrl)
        : new URL("/onboarding/profile", baseUrl);

      const response = NextResponse.redirect(redirectUrl);

      // JWT 토큰을 쿠키에 설정
      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 60, // 30분
        sameSite: "lax",
      });

      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 14 * 24 * 60 * 60, // 14일
        sameSite: "lax",
      });

      return response;
    }

    const response = NextResponse.redirect(
      new URL("/onboarding/profile", baseUrl)
    );

    createTemporarySession(response, {
      provider: "kakao",
      providerId: kakaoId,
      email,
      nickname,
    });

    return response;
  } catch (error) {
    console.error("카카오 로그인 처리 오류:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
