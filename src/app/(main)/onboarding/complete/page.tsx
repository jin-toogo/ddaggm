// src/app/(main)/onboarding/complete/page.tsx
// 개인정보 수집 동의 및 이용약관 동의 페이지

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePendingUser } from "@/hooks/usePendingUser";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OnboardingProgress } from "@/components/interests/OnboardingProgress";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
// 온보딩 단계 정의
const onboardingSteps = [
  { id: "login", title: "소셜 로그인", completed: true },
  { id: "profile", title: "기본 정보", completed: true },
  { id: "interests", title: "관심사 선택", completed: true },
  { id: "complete", title: "설정 완료", completed: false },
];

function CompleteOnboardingContent() {
  const router = useRouter();
  const { pendingUser, loading, error: pendingError } = usePendingUser();
  const [error, setError] = useState<string | null>(null);
  const { refreshSession, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);


  // 동의 상태 관리
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
  });

  useEffect(() => {
    if (!loading && !pendingUser) {
      if (pendingError) {
        setError("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      }
      router.push("/login");
    }
  }, [loading, pendingUser, pendingError, router]);

  // 동의 상태 변경 핸들러
  const handleAgreementChange = (type: keyof typeof agreements) => {
    setAgreements((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // 전체 동의 체크
  const isAllRequiredAgreed =
    agreements.termsOfService && agreements.privacyPolicy;

  const handleComplete = async () => {
    if (!pendingUser) {
      setError("로그인 정보를 확인할 수 없습니다");
      return;
    }

    // 필수 동의 체크
    if (!isAllRequiredAgreed) {
      setError("필수 약관에 동의해주세요");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 세션 스토리지에서 프로필 데이터 가져오기
      const profileDataStr = sessionStorage.getItem("onboarding-profile");
      const profileData = profileDataStr ? JSON.parse(profileDataStr) : {};
      const interestsDataStr = sessionStorage.getItem("onboarding-interests");
      const interestsData = interestsDataStr
        ? JSON.parse(interestsDataStr)
        : {};

      // categoryIds가 배열이 아니라 문자열로 저장된 경우 처리
      let categoryIds = [];
      if (interestsData.categoryIds) {
        if (Array.isArray(interestsData.categoryIds)) {
          categoryIds = interestsData.categoryIds;
        } else if (typeof interestsData.categoryIds === "string") {
          categoryIds = interestsData.categoryIds
            .split(",")
            .map((id: string) => parseInt(id.trim()))
            .filter((id: number) => !isNaN(id));
        }
      }

      // 완전한 등록 데이터 구성
      const registrationData = {
        nickname: profileData.nickname || pendingUser.nickname,
        ageGroup: profileData.ageGroup || pendingUser.ageGroup,
        gender: profileData.gender || pendingUser.gender,
        privacyAgreed: agreements.privacyPolicy,
        termsAgreed: agreements.termsOfService,
        categoryIds: categoryIds,
      };


      const response = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "회원가입에 실패했습니다");
      }

      const result = await response.json();

      // Phase 2: 클라이언트에서 성공 응답을 받으면 사용자 활성화
      if (result.success && result.userId) {
        try {
          const confirmResponse = await fetch("/api/auth/confirm-registration", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ userId: result.userId }),
          });

          if (confirmResponse.ok) {
            // 활성화 성공, JWT 토큰이 쿠키에 설정됨
            const confirmResult = await confirmResponse.json();
            
            // 활성화 성공 시 자동 로그인 처리
            if (confirmResult.user) {
              login(confirmResult.user);
            }
          } else {
            console.warn("사용자 활성화 실패, 하지만 회원가입은 완료됨");
          }
        } catch (confirmError) {
          console.warn("사용자 활성화 요청 실패:", confirmError);
          // 활성화 실패해도 회원가입은 완료된 상태
        }
      }

      // 세션 스토리지 정리
      sessionStorage.removeItem("onboarding-profile");
      sessionStorage.removeItem("onboarding-interests");

      // JWT 토큰이 설정되었으므로 세션 새로고침
      await refreshSession();

      toast.success("회원가입이 완료되었습니다!");

      // 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("Complete registration error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "회원가입 처리 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <OnboardingProgress
                  steps={onboardingSteps}
                  currentStepId="complete"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    서비스 이용을 위한 약관 동의
                  </h2>
                  <p className="text-gray-600">
                    서비스 이용을 위해 아래 약관에 동의해주세요.
                  </p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-red-400">⚠️</div>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                {/* 약관 동의 섹션 */}
                <div className="space-y-6">
                  {/* 전체 동의 */}
                  <div className="border-t pt-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="all-agree"
                        checked={
                          agreements.termsOfService && agreements.privacyPolicy
                        }
                        onChange={() => {
                          const allAgreed =
                            agreements.termsOfService &&
                            agreements.privacyPolicy;
                          setAgreements({
                            termsOfService: !allAgreed,
                            privacyPolicy: !allAgreed,
                          });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="all-agree"
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        전체 동의
                      </label>
                    </div>
                  </div>

                  {/* 이용약관 */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms-of-service"
                        checked={agreements.termsOfService}
                        onChange={() => handleAgreementChange("termsOfService")}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="terms-of-service"
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              이용약관 동의{" "}
                              <span className="text-red-500">*</span>
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              서비스 이용을 위한 기본 약관입니다.
                            </p>
                          </div>
                          <a
                            href="https://toogohada.notion.site/25-09-08-2676cf9d9c3180f5939fc9ebe9689404"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            전문보기
                          </a>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 개인정보처리방침 */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="privacy-policy"
                        checked={agreements.privacyPolicy}
                        onChange={() => handleAgreementChange("privacyPolicy")}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="privacy-policy"
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              개인정보처리방침 동의{" "}
                              <span className="text-red-500">*</span>
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              개인정보 수집 및 이용에 대한 동의입니다.
                            </p>
                          </div>
                          <a
                            href="https://www.notion.so/toogohada/25-09-08-2676cf9d9c3180b5998edbc8216ebd1a"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            전문보기
                          </a>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 완료 버튼 */}
                  <div className="flex justify-end pt-6">
                    <Button
                      onClick={handleComplete}
                      disabled={!isAllRequiredAgreed || isLoading}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>완료 중...</span>
                        </div>
                      ) : (
                        <span>회원가입 완료</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default function CompleteOnboardingPage() {
  return <CompleteOnboardingContent />;
}
