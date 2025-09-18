"use client";

import React, { useLayoutEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface HerbalProduct {
  id: number;
  name: string;
  url: string;
}

export default function HerbalProductPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (searchParams.get("link")) {
      try {
        const productUrl = searchParams.get("link");
        const productId = searchParams.get("productId");

        if (productUrl && productId) {
          // 클릭 카운트 업데이트
          fetch("/api/herbal-products/click", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId: parseInt(productId) }),
          }).catch((error) => {
            console.error("클릭 카운트 업데이트 실패:", error);
          });

          // 외부 링크로 리디렉션
          window.location.href = productUrl;
        } else {
          throw new Error("제품 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    } else {
      setError("잘못된 접근입니다.");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">제품 페이지로 이동 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="text-center py-12">
          <div className="text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-center h-64">
        <p>이동 중...</p>
      </div>
    </div>
  );
}
