"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DropdownFilterProps } from "@/types/components";

export function DropdownFilter({
  label,
  selectedValue,
  options,
  onChange,
  isDisabled = false,
  showDevelopmentTooltip = false,
  width = "w-48",
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayLabel = selectedOption?.label || label;

  const handleOptionClick = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative group">
      <button
        disabled={isDisabled}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
          isDisabled
            ? "text-gray-400 bg-gray-50 cursor-not-allowed"
            : "text-gray-700 bg-white hover:bg-gray-50"
        }`}
      >
        {displayLabel}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      {showDevelopmentTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          개발 중
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 ${width} bg-white border border-gray-200 rounded-lg shadow-lg z-10`}>
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}