import React from "react";
import { ClinicListItem } from "./ClinicListItem";
import { Button } from "@/components/ui/button";
import { Clinic } from "@/types/clinics";

interface ClinicListProps {
  clinics: Clinic[];
  isLoading: boolean;
  searchQuery: string;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function ClinicList({
  clinics,
  isLoading,
  searchQuery,
  hasMore,
  onLoadMore,
}: ClinicListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">검색 중...</p>
      </div>
    );
  }

  if (searchQuery && clinics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-2">
          &quot{searchQuery}&quot에 대한 검색 결과가 없습니다.
        </p>
        <p className="text-sm text-muted-foreground">
          다른 검색어를 시도해보세요.
        </p>
      </div>
    );
  }

  if (clinics.length === 0) {
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
        {clinics.map((clinic) => (
          <ClinicListItem key={clinic.id} clinic={clinic} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-6 ">
          <Button
            size="lg"
            className="text-lg py-6 px-12"
            onClick={onLoadMore}
            variant="outline"
          >
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
}
