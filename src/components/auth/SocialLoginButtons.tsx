"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import KakaoLoginButton from "./KakaoLoginButton";

interface SocialLoginButtonsProps {
  className?: string;
  redirectUrl?: string;
}

export function SocialLoginButtons({ className, redirectUrl }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleNaverLogin = () => {
    setIsLoading("naver");
    
    // redirectUrl이 있으면 URL 파라미터로 전달
    const loginUrl = redirectUrl 
      ? `/api/auth/naver?redirectUrl=${encodeURIComponent(redirectUrl)}`
      : `/api/auth/naver`;
    
    window.location.href = loginUrl;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 네이버 로그인 버튼 */}
      <Button
        onClick={handleNaverLogin}
        disabled={isLoading !== null}
        className="w-full h-12 bg-[#03C75A] hover:bg-[#02B350] text-white font-medium flex items-center justify-center space-x-3 rounded-lg transition-colors"
      >
        {isLoading === "naver" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {/* 네이버 로고 */}
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <span className="text-[#03C75A] text-xs font-bold">N</span>
            </div>
            <span>네이버로 시작하기</span>
          </>
        )}
      </Button>

      {/* 카카오 로그인 버튼 */}
      <KakaoLoginButton redirectUrl={redirectUrl} />

      {/* 구분선 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        {/* <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500">또는</span>
        </div> */}
      </div>

      {/* 개인정보 처리 안내 */}
      <p className="text-xs text-gray-500 text-center leading-relaxed pt-6">
        소셜 로그인 시 해당 플랫폼의 이름, 이메일, 프로필 이미지 정보가
        <br />
        서비스 이용을 위해 수집됩니다.
      </p>
    </div>
  );
}
