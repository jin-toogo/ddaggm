"use client";

import React, { useState, useCallback } from "react";
import { InterestCard } from "./InterestCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  displayOrder: number;
}

interface InterestSelectorProps {
  categories: Category[];
  selectedCategoryIds: number[];
  onSelectionChange: (categoryIds: number[]) => void;
  onComplete: () => void;
  isLoading?: boolean;
  className?: string;
}

export function InterestSelector({
  categories,
  selectedCategoryIds,
  onSelectionChange,
  onComplete,
  isLoading = false,
  className,
}: InterestSelectorProps) {
  const router = useRouter();
  const [localSelected, setLocalSelected] =
    useState<number[]>(selectedCategoryIds);

  const handleToggle = useCallback(
    (categoryId: number) => {
      setLocalSelected((prev) => {
        const newSelection = prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId];

        // 다음 틱에서 부모 컴포넌트 업데이트
        setTimeout(() => {
          onSelectionChange(newSelection);
        }, 0);

        return newSelection;
      });
    },
    [onSelectionChange]
  );

  const handleContinue = () => {
    if (localSelected.length > 0) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    router.push("/onboarding/profile");
  };

  // 진행률 계산 (최소 1개 선택 시 100%)
  const progressValue = localSelected.length > 0 ? 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 진행 상태 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">관심사 선택</span>
          <span className="text-gray-500">{localSelected.length}개 선택됨</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* 관심사 그리드 */}
      <div
        data-testid="interests-grid"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
      >
        {categories
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((category) => (
            <InterestCard
              key={category.id}
              id={category.id}
              name={category.name}
              description={category.description}
              icon={category.icon}
              selected={localSelected.includes(category.id)}
              onToggle={handleToggle}
            />
          ))}
      </div>

      {/* 선택 도움말 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-lg">💡</div>
          <div className="text-sm">
            <p className="text-blue-900 font-medium mb-1">관심사 선택 도움말</p>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• 현재 치료받고 싶은 분야를 선택해주세요</li>
              <li>• 여러 개 선택 가능하며, 나중에 변경할 수 있습니다</li>
              <li>• 선택한 관심사에 따라 맞춤 한의원을 추천해드려요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <Button
          onClick={handleContinue}
          disabled={localSelected.length === 0 || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>처리 중...</span>
            </div>
          ) : (
            `${localSelected.length}개 선택`
          )}
        </Button>

        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={isLoading}
          className="sm:w-auto h-12"
        >
          이전
        </Button>
      </div>

      {/* 건너뛰기 설명 */}
      <p className="text-xs text-gray-500 text-center">
        건너뛰기를 선택하면 일반적인 추천을 받게 되며,
        <br />
        나중에 프로필에서 관심사를 설정할 수 있습니다.
      </p>
    </div>
  );
}
