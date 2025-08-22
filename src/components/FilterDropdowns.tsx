import React from "react";
import { DropdownFilter } from "@/components/ui/DropdownFilter";
import { FilterDropdownsProps } from "@/types";

export function FilterDropdowns({
  selectedCity,
  selectedDistrict,
  onCityChange,
  onDistrictChange,
  totalCount,
  cities,
  districts,
}: FilterDropdownsProps) {
  const cityOptions = [
    { value: "all", label: "전체" },
    ...cities.map(city => ({ value: city, label: city }))
  ];

  const districtOptions = [
    { value: "all", label: "전체" },
    ...districts.map(district => ({ value: district, label: district }))
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            도시:
          </label>
          <DropdownFilter
            label="도시 선택"
            selectedValue={selectedCity}
            options={cityOptions}
            onChange={onCityChange}
            width="w-32"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            구/군:
          </label>
          <DropdownFilter
            label="구/군 선택"
            selectedValue={selectedDistrict}
            options={districtOptions}
            onChange={onDistrictChange}
            isDisabled={selectedCity === "all"}
            width="w-32"
          />
        </div>
      </div>
    </div>
  );
}
