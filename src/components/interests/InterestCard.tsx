"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface InterestCardProps {
  id: number;
  name: string;
  description?: string;
  icon: string;
  selected: boolean;
  onToggle: (id: number) => void;
  className?: string;
}

export function InterestCard({
  id,
  name,
  description,
  icon,
  selected,
  onToggle,
  className
}: InterestCardProps) {
  const handleClick = () => {
    onToggle(id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onToggle(id);
    }
  };

  return (
    <div
      data-testid="interest-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[120px]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "hover:scale-105 active:scale-95",
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
        className
      )}
      aria-pressed={selected}
      aria-label={`${name} 관심사 ${selected ? '선택됨' : '선택 안됨'}`}
    >
      {/* 선택 상태 표시 */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* 아이콘 */}
      <div className="text-3xl mb-2 text-center">
        {icon}
      </div>

      {/* 제목 */}
      <h3 className={cn(
        "font-medium text-center text-sm mb-1",
        selected ? "text-blue-900" : "text-gray-900"
      )}>
        {name}
      </h3>

      {/* 설명 */}
      {description && (
        <p className={cn(
          "text-xs text-center leading-tight",
          selected ? "text-blue-600" : "text-gray-500"
        )}>
          {description}
        </p>
      )}

      {/* 호버 효과 */}
      <div className={cn(
        "absolute inset-0 rounded-xl transition-opacity",
        "opacity-0 hover:opacity-5",
        selected ? "bg-blue-500" : "bg-gray-900"
      )} />
    </div>
  );
}