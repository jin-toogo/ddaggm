"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Kakao: any;
  }
}

export interface KakaoLoginButtonProps {
  onSuccess?: (userData: User) => void;
  onError?: (error: ApiError) => void;
  redirectUrl?: string;
}
export interface User {
  id: number;
  nickname: string;
  email?: string;
  ageGroup?: string;
  gender?: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  providerId: string;
  provider: string;
  isOnboarded: boolean; // 온보딩 완료 여부 (10개 이상 등록 시 true)
  totalRestaurants: number; // 등록한 총 맛집 수
}
// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export default function KakaoLoginButton({ redirectUrl }: KakaoLoginButtonProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);
  useEffect(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    if (!kakaoKey) {
      console.error(
        "Kakao JavaScript Key is not set in environment variables."
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey);
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleKakaoLogin = () => {
    if (window.Kakao && window.Kakao.Auth) {
      const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
      if (!redirectUri) {
        console.error(
          "Kakao redirect URI is not set in environment variables."
        );
        return;
      }

      // redirectUrl이 있으면 세션 스토리지에 저장
      if (redirectUrl) {
        sessionStorage.setItem('loginRedirectUrl', redirectUrl);
      }

      setIsLoading(true);

      window.Kakao.Auth.authorize({
        redirectUri: redirectUri,
        scope: "account_email",
      });
    } else {
      console.error("Kakao SDK not loaded or initialized.");
    }
  };

  return (
    <Button
      onClick={handleKakaoLogin}
      // disabled={disabled || isLoading || !isSDKReady}
      className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-medium flex items-center justify-center space-x-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {/* 카카오 로고 */}
          <div className="w-5 h-5 flex items-center justify-center">
            <svg
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0C4.477 0 0 3.36 0 7.5c0 2.68 1.785 5.032 4.463 6.437l-.894 3.283c-.067.245.245.44.447.287L7.86 15.13C8.55 15.24 9.265 15.3 10 15.3c5.523 0 10-3.36 10-7.5S15.523 0 10 0z"
                fill="#191919"
              />
            </svg>
          </div>
          <span>카카오로 시작하기</span>
        </>
      )}
    </Button>
  );
}
