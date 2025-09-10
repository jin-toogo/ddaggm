"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function AdditionalInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [provider, setProvider] = useState<string>("kakao");
  const [isLoading, setIsLoading] = useState(false);
  const [editableNickname, setEditableNickname] = useState("");

  useEffect(() => {
    // 가이드 패턴: temp_user 키 사용
    const tempUserCookie = sessionStorage.getItem("temp_user");
    if (!tempUserCookie) {
      // 접근 불가 - 홈으로 리다이렉트
      router.push("/");
      return;
    }

    try {
      const userData = JSON.parse(tempUserCookie);
      setUserData(userData);
      setProvider(userData.provider?.toLowerCase() || "kakao");
      setEditableNickname(userData.nickname || "");
    } catch (error) {
      console.error("임시 사용자 데이터 파싱 오류:", error);
      router.push("/");
    }
  }, [router]);

  const handleCompleteSignup = async () => {
    if (!userData) return;

    // 닉네임 검증
    if (!editableNickname.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 가이드 패턴: 새로운 register API 사용
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: userData.provider,
          providerId: userData.providerId,
          email: userData.email,
          nickname: editableNickname.trim() || userData.nickname,
          profileImageUrl: userData.profileImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("사용자 등록 실패:", errorData);
        throw new Error(errorData.error || "사용자 등록에 실패했습니다.");
      }

      const result = await response.json();

      // 가이드 패턴: 등록 완료 후 로그인 처리
      login(result.user);

      // 임시 데이터 제거
      sessionStorage.removeItem("temp_user");

      // 성공 메시지 표시
      toast.success("회원가입이 완료되었습니다! 환영합니다!");

      // 홈페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("회원가입 완료 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "회원가입 처리 중 오류가 발생했습니다."
      );
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 정보 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            환영합니다! {editableNickname || "사용자"}님
          </h1>
          <p className="text-gray-600">
            따금 서비스 이용을 위해 회원가입을 완료해주세요.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nickname"
                className="text-sm font-medium text-gray-900"
              >
                이름
              </label>
              <input
                id="nickname"
                type="text"
                value={editableNickname}
                onChange={(e) => setEditableNickname(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="닉네임을 입력해주세요"
              />
            </div>

            {userData.email && (
              <div>
                <label className="text-sm font-medium text-gray-900">
                  이메일
                </label>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            )}

            <div className="pt-4">
              <p className="text-xs text-gray-500 mb-4">
                회원가입 시 개인정보 처리방침 및 이용약관에 동의한 것으로
                간주됩니다.
              </p>

              <Button
                onClick={handleCompleteSignup}
                disabled={isLoading || !editableNickname.trim()}
                className="w-full"
              >
                {isLoading ? "회원가입 처리 중..." : "회원가입 완료"}
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem("temp_user");
              router.push("/");
            }}
            className="text-gray-500"
          >
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdditionalInfoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AdditionalInfoContent />
    </Suspense>
  );
}
