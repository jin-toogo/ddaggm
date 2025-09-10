"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { InterestSelector } from "@/components/interests/InterestSelector";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  displayOrder: number;
}

interface UserInterest {
  id: number;
  categoryId: number;
  category: Category;
}

export default function InterestsManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentInterests, setCurrentInterests] = useState<UserInterest[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 세션 확인
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoadingData(true);

        // 카테고리와 사용자 관심사를 병렬로 로드
        const [categoriesResponse, interestsResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/users/interests"),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error("카테고리를 불러오는데 실패했습니다");
        }

        if (!interestsResponse.ok) {
          throw new Error("관심사를 불러오는데 실패했습니다");
        }

        const categoriesData = await categoriesResponse.json();
        const interestsData = await interestsResponse.json();

        setCategories(categoriesData.categories);
        setCurrentInterests(interestsData.interests);

        // 현재 선택된 카테고리 ID들 설정
        const selectedIds = interestsData.interests.map(
          (interest: UserInterest) => interest.categoryId
        );
        setSelectedCategoryIds(selectedIds);
      } catch (error) {
        console.error("Data fetch error:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSelectionChange = (categoryIds: number[]) => {
    setSelectedCategoryIds(categoryIds);
  };

  const handleComplete = async () => {
    if (!user) {
      setError("로그인 정보를 확인할 수 없습니다");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/interests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryIds: selectedCategoryIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "관심사 저장에 실패했습니다");
      }

      // 성공 시 프로필 페이지로 이동
      router.push("/profile");
    } catch (error) {
      console.error("Update interests error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "관심사 저장 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 상태
  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">관심사 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않음
  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Link href="/profile">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">
                  관심사 수정
                </h1>
              </div>

              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.nickname}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="py-8 px-4">
          {/* 설명 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              관심 있는 치료 분야를 선택해주세요
            </h2>
            <p className="text-gray-600">
              관심사를 변경하면 맞춤형 한의원 추천이 업데이트됩니다.
              <br />
              여러 개 선택 가능하며, 언제든 다시 변경할 수 있습니다.
            </p>
          </div>

          {/* 현재 관심사 표시 */}
          {currentInterests.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                현재 설정된 관심사 ({currentInterests.length}개)
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentInterests.map((interest) => (
                  <span
                    key={interest.id}
                    className="text-xs bg-white text-blue-700 px-2 py-1 rounded-full border border-blue-300"
                  >
                    {interest.category.icon} {interest.category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
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

          {/* 추가 설명 */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-gray-400 text-lg">ℹ️</div>
              <div className="text-sm">
                <p className="text-gray-700 font-medium mb-1">
                  관심사 변경 안내
                </p>
                <ul className="text-gray-600 space-y-1 text-xs">
                  <li>• 변경된 관심사는 즉시 추천 시스템에 반영됩니다</li>
                  <li>• 관심사를 모두 해제하면 일반적인 추천을 받게 됩니다</li>
                  <li>• 나중에 프로필에서 언제든 다시 변경할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
