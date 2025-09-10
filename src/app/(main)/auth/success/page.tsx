"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Google Analytics dataLayer 타입 정의
declare global {
  interface Window {
    dataLayer: any[];
  }
}

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession, user } = useAuth();
  const [status, setStatus] = useState("로그인 처리 중...");
  const isProcessing = useRef(false);

  useEffect(() => {
    const processAuthSuccess = async () => {
      // 중복 실행 방지
      if (isProcessing.current) return;
      isProcessing.current = true;
      try {
        const provider = searchParams.get("provider");
        const redirectUrl = searchParams.get("redirectUrl") || "/";
        const isOnboarding = searchParams.get("onboarding") === "true";


        // 서버 쿠키 상태를 클라이언트와 동기화
        setStatus("사용자 정보 확인 중...");
        const currentUser = await refreshSession(); // 직접 반환값 사용
        if (!currentUser) {
          toast.error("로그인 처리 중  1 오류가 발생했습니다.");
          router.push("/login");
          return;
        }


        // Google Analytics 이벤트 전송
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "login",
            user_id: currentUser.id,
            login_method: provider || currentUser.provider,
          });
        } catch (error) {
          console.warn("GA 이벤트 전송 실패:", error);
        }

        if (isOnboarding) {
          toast.success("회원가입이 완료되었습니다! 환영합니다!");
          setStatus("회원가입 완료! 잠시만 기다려주세요...");
        } else {
          setStatus("로그인 완료! 잠시만 기다려주세요...");
        }

        router.push(redirectUrl);
      } catch (error) {
        console.error("Auth success 처리 오류:", error);
        toast.error("로그인 처리 중 2 오류가 발생했습니다.");
        setStatus("오류가 발생했습니다. 다시 시도해주세요.");

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    processAuthSuccess();
  }, [searchParams, router, refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">로그인 중</h1>
        </div>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
