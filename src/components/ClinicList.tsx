import React from "react";
import { ClinicListItem } from "./ClinicListItem";
import { ClinicListProps } from "@/types";

export function ClinicList({
  clinics,
  isLoading,
  searchQuery,
}: ClinicListProps) {
  // 안전장치: clinics가 배열이 아닌 경우 빈 배열로 처리
  const safeClinic = Array.isArray(clinics) ? clinics : [];
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">검색 중...</p>
      </div>
    );
  }

  if (searchQuery && safeClinic.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-2">
          &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다.
        </p>
        <p className="text-sm text-muted-foreground">
          다른 검색어를 시도해보세요.
        </p>
      </div>
    );
  }

  if (safeClinic.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          검색어를 입력하거나 필터를 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {safeClinic.map((clinic) => (
          <ClinicListItem key={clinic.id} clinic={clinic} />
        ))}
      </div>
    </div>
  );
}
