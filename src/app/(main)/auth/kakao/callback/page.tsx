"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleFallbackRedirect = () => {
      
      // API 콜백이 실행되지 않은 경우의 fallback
      // 모든 파라미터를 /auth/success로 전달
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      
      if (error) {
        console.error("카카오 인증 오류:", error);
        router.push("/login?message=카카오 로그인이 취소되었습니다.");
        return;
      }
      
      if (!code) {
        console.error("인증 코드 없음");
        router.push("/login?message=인증 코드가 필요합니다.");
        return;
      }
      
      // /auth/success로 리다이렉트하여 통합 처리
      const successUrl = new URL("/auth/success", window.location.origin);
      successUrl.searchParams.set("provider", "kakao");
      successUrl.searchParams.set("redirectUrl", "/");
      successUrl.searchParams.set("fallback", "true");
      
      router.push(successUrl.pathname + successUrl.search);
    };

    // 약간의 지연을 두어 API 콜백이 먼저 처리될 기회를 줌
    const timeoutId = setTimeout(handleFallbackRedirect, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">카카오 로그인 처리 중...</p>
        <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}
