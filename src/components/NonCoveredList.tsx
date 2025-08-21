"use client";

import React from "react";
import { Building2 } from "lucide-react";
import Link from "next/link";

interface NonCoveredItem {
  id: number;
  treatmentName: string;
  category: string;
  amount: number;
  clinicName: string;
  npayCode: string;
  yadmNm: string;
  hospitalId: number;
  province: string;
  district: string;
}

interface TreatmentCategory {
  id: string;
  name: string;
  description: string;
  dataCount: number;
  percentage: number;
  keywords: string[];
}

interface NonCoveredListProps {
  items: NonCoveredItem[];
  isLoading: boolean;
  searchQuery: string;
  selectedTreatment: string;
  treatmentCategories: TreatmentCategory[];
}

export function NonCoveredList({
  items,
  isLoading,
  searchQuery,
  selectedTreatment,
  treatmentCategories,
}: NonCoveredListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? (
              <>
                '<span className="font-medium">{searchQuery}</span>'에 대한
                비급여 항목을 찾을 수 없습니다.
              </>
            ) : selectedTreatment !== "all" ? (
              <>선택한 치료법에 해당하는 비급여 항목이 없습니다.</>
            ) : (
              "비급여 항목이 없습니다."
            )}
          </p>
          <div className="text-sm text-gray-400">
            <p>• 다른 검색어를 시도해보세요</p>
            <p>• 치료법 필터를 변경해보세요</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색/필터 결과 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedTreatment === "all"
              ? "전체 비급여 항목"
              : treatmentCategories.find((cat) => cat.id === selectedTreatment)
                  ?.name || "비급여 항목"}
          </h3>
          {searchQuery && (
            <span className="text-sm text-gray-500">
              • "{searchQuery}" 검색 결과
            </span>
          )}
        </div>
      </div>

      {/* 비급여 항목 리스트 */}
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/hospital/${item.hospitalId}`}
            className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm hover:border-primary-300 transition-all cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
              {/* 왼쪽: 치료 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {/* 치료명 */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                      {item.treatmentName}
                    </h4>
                  </div>
                </div>

                {/* 한의원 정보 */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium text-gray-700">
                      {item.clinicName} • {item.province} {item.district}
                    </span>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 가격 정보 */}
              <div className="flex-shrink-0 text-right sm:text-right w-full sm:w-auto">
                <div className="text-2xl font-bold text-primary-600">
                  {item.amount?.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-500">비급여 진료비</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
