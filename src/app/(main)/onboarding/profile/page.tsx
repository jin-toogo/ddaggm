"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePendingUser } from "@/hooks/usePendingUser";
import { OnboardingProgress } from "@/components/interests/OnboardingProgress";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, ArrowRight } from "lucide-react";

function ProfileOnboardingContent() {
  const { pendingUser, loading, error: pendingError } = usePendingUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    nickname: "",
    ageGroup: "",
    gender: "",
  });

  // 온보딩 단계 정의
  const onboardingSteps = [
    { id: "login", title: "소셜 로그인", completed: true },
    { id: "profile", title: "기본 정보", completed: false },
    { id: "interests", title: "관심사 선택", completed: false },
    { id: "complete", title: "완료", completed: false },
  ];

  // 세션 확인 및 기본값 설정
  useEffect(() => {
    if (!loading && !pendingUser) {
      if (pendingError) {
        setError("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      }
      router.push("/login");
      return;
    }

    if (pendingUser) {
      setFormData({
        nickname: pendingUser.nickname || "",
        ageGroup: pendingUser.ageGroup || "",
        gender: pendingUser.gender || "",
      });
    }
  }, [loading, pendingUser, pendingError, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = async () => {
    if (!pendingUser) {
      setError("로그인 정보를 확인할 수 없습니다");
      return;
    }

    // 필수 입력 체크
    if (!formData.nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }

    if (!formData.ageGroup.trim()) {
      setError("나이대를 선택해주세요");
      return;
    }

    if (!formData.gender.trim()) {
      setError("성별을 선택해주세요");
      return;
    }

    setError(null);

    // 프로필 데이터를 세션 스토리지에 저장하고 다음 단계로
    sessionStorage.setItem(
      "onboarding-profile",
      JSON.stringify({
        nickname: formData.nickname.trim(),
        ageGroup: formData.ageGroup || null,
        gender: formData.gender || null,
      })
    );

    // 다음 단계로 이동 (API 호출하지 않음)
    router.push("/onboarding/interests");
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않음
  if (!pendingUser) {
    return null;
  }

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
                <h1 className="text-xl font-semibold text-gray-900">
                  계정 설정
                </h1>
              </div>

              {pendingUser && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{pendingUser.email}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 사이드바 - 진행 상태 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <OnboardingProgress
                  steps={onboardingSteps}
                  currentStepId="profile"
                />
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
                {/* 제목 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    기본 정보를 입력해주세요
                  </h2>
                  <p className="text-gray-600">
                    더 나은 서비스 제공을 위해 기본 정보를 입력해주세요.
                    <br />
                    나이대와 성별은 선택사항입니다.
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

                {/* 프로필 폼 */}
                <div className="space-y-6">
                  {/* 닉네임 */}
                  <div>
                    <label
                      htmlFor="nickname"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      닉네임 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nickname"
                      value={formData.nickname}
                      onChange={(e) =>
                        handleInputChange("nickname", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="사용하실 닉네임을 입력해주세요"
                      required
                    />
                  </div>

                  {/* 나이대 */}
                  <div>
                    <label
                      htmlFor="ageGroup"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      나이대 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ageGroup"
                      value={formData.ageGroup}
                      onChange={(e) =>
                        handleInputChange("ageGroup", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">선택해주세요</option>
                      <option value="10-19">10대</option>
                      <option value="20-29">20대</option>
                      <option value="30-39">30대</option>
                      <option value="40-49">40대</option>
                      <option value="50-59">50대</option>
                      <option value="60+">60대 이상</option>
                    </select>
                  </div>

                  {/* 성별 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      성별 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-4">
                      {[
                        { value: "m", label: "남성" },
                        { value: "f", label: "여성" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value={option.value}
                            checked={formData.gender === option.value}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 개인정보처리방침 동의 안내 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600">
                      다음 단계 진행 시 개인정보처리방침에 동의한 것으로
                      간주됩니다.
                    </p>
                  </div>

                  {/* 버튼 */}
                  <div className="flex justify-end pt-6">
                    <Button
                      onClick={handleNext}
                      disabled={!formData.nickname.trim()}
                      className="px-6 py-3"
                    >
                      <div className="flex items-center space-x-2">
                        <span>다음 단계</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
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

export default function ProfileOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ProfileOnboardingContent />
    </Suspense>
  );
}
