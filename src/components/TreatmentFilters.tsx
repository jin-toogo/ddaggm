"use client";

import React, { useState } from "react";
import { cities } from "@/lib/clinics";
import { DropdownFilter } from "@/components/ui/DropdownFilter";
import { TreatmentFiltersProps } from "@/types";

export function TreatmentFilters({
  categories,
  selectedTreatment,
  onTreatmentChange,
  selectedLocation = "all",
  onLocationChange,
}: TreatmentFiltersProps) {
  const locationOptions = [
    { value: "all", label: "전국" },
    ...cities.map((city) => ({ value: city, label: city })),
  ];

  const sortOptions = [
    { value: "price_asc", label: "가격 낮은순" },
    { value: "price_desc", label: "가격 높은순" },
  ];

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

          <DropdownFilter
            label="지역"
            selectedValue={selectedLocation}
            options={locationOptions}
            onChange={(value) => onLocationChange?.(value)}
            isDisabled={true}
            showDevelopmentTooltip={true}
            width="w-48"
          />

          <DropdownFilter
            label="정렬"
            selectedValue="price_asc"
            options={sortOptions}
            onChange={() => {}}
            isDisabled={true}
            showDevelopmentTooltip={true}
            width="w-40"
          />
        </div>
      </div>
    </div>
  );
}
