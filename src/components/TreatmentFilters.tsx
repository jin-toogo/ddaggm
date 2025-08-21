"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cities } from "@/lib/clinics";

interface TreatmentCategory {
  id: string;
  name: string;
  description: string;
  dataCount: number;
  percentage: number;
  keywords: string[];
}

interface TreatmentFiltersProps {
  categories: TreatmentCategory[];
  selectedTreatment: string;
  onTreatmentChange: (treatment: string) => void;
  totalCount: number;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
}

export function TreatmentFilters({
  categories,
  selectedTreatment,
  onTreatmentChange,
  selectedLocation = "all",
  onLocationChange,
}: TreatmentFiltersProps) {
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);

  return (
    <div className="bg-white">
      {/* 탭 스타일 치료법 필터 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {/* 전체 탭 */}
          <button
            onClick={() => onTreatmentChange("all")}
            className={`py-4 px-2 border-b-2 font-medium text-base whitespace-nowrap transition-colors ${
              selectedTreatment === "all"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            전체
          </button>

          {/* 치료법 탭들 */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onTreatmentChange(category.id)}
              className={`py-4 px-2 border-b-2 font-medium text-base whitespace-nowrap transition-colors ${
                selectedTreatment === category.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 드롭다운 필터 섹션 */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">필터</span>

          {/* 지역 필터 드롭다운 - hover시 '개발 중' 표시 */}
          <div className="relative group">
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
            >
              {selectedLocation === "all" ? "전국" : selectedLocation}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showLocationFilter ? "rotate-180" : ""
                }`}
              />
            </button>
            
            {/* 개발 중 툴팁 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              개발 중
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>

            {showLocationFilter && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      onLocationChange?.("all");
                      setShowLocationFilter(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    전국
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        onLocationChange?.(city);
                        setShowLocationFilter(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 추천순 필터 드롭다운 - hover시 '개발 중' 표시 */}
          <div className="relative group">
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
            >
              가격 낮은순
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showSortFilter ? "rotate-180" : ""
                }`}
              />
            </button>
            
            {/* 개발 중 툴팁 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              개발 중
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>

            {showSortFilter && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {/* <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    추천순
                  </button> */}
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    가격 낮은순
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    가격 높은순
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 드롭다운이 열려있을 때 배경 클릭으로 닫기 */}
      {(showLocationFilter || showSortFilter) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowLocationFilter(false);
            setShowSortFilter(false);
          }}
        />
      )}
    </div>
  );
}
