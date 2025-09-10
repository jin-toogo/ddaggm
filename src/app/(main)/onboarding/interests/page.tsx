"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePendingUser } from "@/hooks/usePendingUser";
import { useAuth } from "@/hooks/useAuth";
import { InterestSelector } from "@/components/interests/InterestSelector";
import { OnboardingProgress } from "@/components/interests/OnboardingProgress";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  displayOrder: number;
}

function InterestsOnboardingContent() {
  const { pendingUser, loading, error: pendingError } = usePendingUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 온보딩 단계 정의
  const onboardingSteps = [
    { id: "login", title: "소셜 로그인", completed: true },
    { id: "profile", title: "기본 정보", completed: true },
    { id: "interests", title: "관심사 선택", completed: false },
    { id: "complete", title: "설정 완료", completed: false },
  ];

  // 세션 확인
  useEffect(() => {
    if (!loading && !pendingUser) {
      if (pendingError) {
        setError("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      }
      router.push("/login");
    }
  }, [loading, pendingUser, pendingError, router]);

  // 카테고리 데이터 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("카테고리를 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Categories fetch error:", error);
        setError("카테고리를 불러오는 중 오류가 발생했습니다");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (pendingUser) {
      fetchCategories();
    }
  }, [pendingUser]);

  const handleSelectionChange = (categoryIds: number[]) => {
    setSelectedCategoryIds(categoryIds);
  };

  const handleComplete = async () => {
    if (!pendingUser) {
      setError("로그인 정보를 확인할 수 없습니다");
      return;
    }

    setError(null);

    // 관심사 데이터를 세션 스토리지에 저장하고 다음 단계로
    sessionStorage.setItem(
      "onboarding-interests",
      JSON.stringify({
        categoryIds: selectedCategoryIds, // 배열 그대로 저장
      })
    );


    // 다음 단계로 이동 (API 호출하지 않음)
    router.push("/onboarding/complete");
  };

  // 로딩 중
  if (loading || isLoadingCategories) {
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
                  <span>{pendingUser.nickname}</span>
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
                  currentStepId="interests"
                />
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
                {/* 제목 */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    어떤 이유로 한의원을 찾고 계신가요?
                  </h2>
                  <p className="text-gray-600">
                    관심 있는 치료 분야를 선택해주시면 맞춤형 한의원을
                    추천해드려요.
                    <br />
                    여러 개 선택 가능하며, 나중에 언제든 변경할 수 있습니다.
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

                {/* 관심사 선택기 */}
                <InterestSelector
                  categories={categories}
                  selectedCategoryIds={selectedCategoryIds}
                  onSelectionChange={handleSelectionChange}
                  onComplete={handleComplete}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default function InterestsOnboardingPage() {
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
      <InterestsOnboardingContent />
    </Suspense>
  );
}
