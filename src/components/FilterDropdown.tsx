import React from "react";

import { cities, districts } from "@/lib/clinics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FilterDropdownsProps } from "@/types";

export function FilterDropdowns({
  selectedCity,
  selectedDistrict,
  onCityChange,
  onDistrictChange,
  totalCount,
}: FilterDropdownsProps) {
  const availableDistricts =
    selectedCity && selectedCity !== "all" ? districts[selectedCity] || [] : [];

  const handleCityChange = (city: string) => {
    onCityChange(city);
    if (selectedDistrict && selectedDistrict !== "all") {
      onDistrictChange("all");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedCity || "all"} onValueChange={handleCityChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="시/도 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDistrict || "all"}
          onValueChange={onDistrictChange}
          disabled={!selectedCity || selectedCity === "all"}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="시/군/구 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {availableDistricts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        총 {totalCount}개 한의원
      </div>
    </div>
  );
}
