"use client";

import { useState } from "react";
import { DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { NonPaymentItemsProps } from "@/types";

export default function NonPaymentItems({ items }: NonPaymentItemsProps) {
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const displayItems = showAll ? items : items.slice(0, 10);

  const handleToggle = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowAll(!showAll);
      setIsLoading(false);
    }, 200);
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">비급여 진료비</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>비급여 진료비 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">비급여 진료비</h2>
      </div>

      <div className="space-y-3">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="border-b border-gray-100 pb-3 last:border-b-0"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1 truncate">
                  {item.treatmentName || "치료명 미상"}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.category || "분류 미상"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-lg font-semibold text-blue-600">
                  {item.amount
                    ? `${item.amount.toLocaleString()}원`
                    : "가격 문의"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {items.length > 10 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                총 {items.length}개 항목 중 {displayItems.length}개 표시
              </p>
              <button
                onClick={handleToggle}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    로딩 중...
                  </>
                ) : showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    간단히 보기
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />더 보기
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
