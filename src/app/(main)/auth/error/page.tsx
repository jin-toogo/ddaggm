"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get("message") || "로그인 중 오류가 발생했습니다.";

  const handleRetry = () => {
    router.push("/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleKakaoLogin = () => {
    window.location.href = "/api/auth/kakao";
  };

  const handleNaverLogin = () => {
    window.location.href = "/api/auth/naver";
  };

  // 에러 메시지에서 권장 로그인 방법 파악
  const isKakaoRecommended = errorMessage.includes("카카오");
  const isNaverRecommended = errorMessage.includes("네이버");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인 오류</h1>

        <p className="text-gray-600 mb-8">{errorMessage}</p>

        <div className="space-y-3">
          {/* {isKakaoRecommended && (
            <Button
              onClick={handleKakaoLogin}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              카카오 로그인하기
            </Button>
          )}
          
          {isNaverRecommended && (
            <Button
              onClick={handleNaverLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              네이버 로그인하기
            </Button>
          )} */}

          <Button
            onClick={handleRetry}
            variant={
              isKakaoRecommended || isNaverRecommended ? "outline" : "default"
            }
            className="w-full"
          >
            다른 방법으로 로그인
          </Button>

          <Button onClick={handleGoHome} variant="outline" className="w-full">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
