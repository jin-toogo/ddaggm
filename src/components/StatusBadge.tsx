import React from "react";
import { Badge } from "./ui/badge";

interface StatusBadgeProps {
  status: "confirmed" | "unknown";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "confirmed") {
    return (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 border-green-200"
      >
        보험 적용 가능 (시범사업)
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-gray-100 text-gray-600 border-gray-200"
    >
      데이터 없음 (미확인)
    </Badge>
  );
}
