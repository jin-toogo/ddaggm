import React from "react";

interface FilterDropdownsProps {
  selectedCity: string;
  selectedDistrict: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  totalCount: number;
  cities: string[];
  districts: string[];
}

export function FilterDropdowns({
  selectedCity,
  selectedDistrict,
  onCityChange,
  onDistrictChange,
  totalCount,
  cities,
  districts,
}: FilterDropdownsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="city" className="text-sm font-medium text-foreground">
            도시:
          </label>
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">전체</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="district"
            className="text-sm font-medium text-foreground"
          >
            구/군:
          </label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={selectedCity === "all"}
          >
            <option value="all">전체</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
