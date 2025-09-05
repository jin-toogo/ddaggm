import React from "react";

interface NaverBlogIconProps {
  className?: string;
  size?: number;
}

export function NaverBlogIcon({
  className = "",
  size = 16,
}: NaverBlogIconProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 네이버 초록색 배경 원 */}
        <circle cx="12" cy="12" r="12" fill="#03C75A" />

        {/* 네이버 N 로고 */}
        <path
          d="M7.5 6.5h2.8l4.2 7.8V6.5h2.8v11h-2.8L9.3 9.7v7.8H6.5v-11z"
          fill="white"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

// 작은 버전 (12px)
export function NaverBlogIconSmall({ className = "" }: { className?: string }) {
  return <NaverBlogIcon className={className} size={12} />;
}

// 미디엄 버전 (16px)
export function NaverBlogIconMedium({
  className = "",
}: {
  className?: string;
}) {
  return <NaverBlogIcon className={className} size={16} />;
}

// 큰 버전 (24px)
export function NaverBlogIconLarge({ className = "" }: { className?: string }) {
  return <NaverBlogIcon className={className} size={24} />;
}
