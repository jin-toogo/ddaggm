"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TreatmentFilters } from "@/components/TreatmentFilters";
import { NonCoveredList } from "@/components/NonCoveredList";
import { treatmentCategories } from "@/lib/clinics";
import { NonCoveredItem } from "@/types";
import { DEFAULT_LOCATION, ITEMS_PER_PAGE } from "@/constants";

export function NonCoveredContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [nonCoveredItems, setNonCoveredItems] = useState<NonCoveredItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState("chuna");
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // URL 파라미터에서 초기 상태 설정
  useEffect(() => {
    const query = searchParams.get('search') || '';
    const treatment = searchParams.get('treatment') || 'chuna';
    const location = searchParams.get('location') || DEFAULT_LOCATION;
    
    setSearchQuery(query);
    setSelectedTreatment(treatment);
    setSelectedLocation(location);
  }, [searchParams]);

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchNonCoveredItems = async () => {
      try {
        // URL 파라미터가 있으면 해당 값으로 검색, 없으면 기본값
        const treatment = searchParams.get('treatment') || 'chuna';
        const query = searchParams.get('search') || '';
        
        // 치료법에 따른 카테고리 변환
        const category = treatmentCategories.find(cat => cat.id === treatment);
        const categoryParam = category ? encodeURIComponent(category.searchKeyword) : '%EC%B6%94%EB%82%98';
        
        let url = `/api/nonpayment/items?category=${categoryParam}&page=1&limit=${ITEMS_PER_PAGE}`;
        if (query.trim()) {
          url += `&search=${encodeURIComponent(query.trim())}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Initial API Error:", response.status, errorText);
          throw new Error(
            `Failed to fetch initial data: ${response.status} - ${errorText}`
          );
        }
        const result = await response.json();

        setNonCoveredItems(result.data || []);
        setCurrentPage(result.pagination?.currentPage || 1);
        setTotalPages(result.pagination?.totalPages || 0);
        setTotalCount(result.pagination?.totalCount || 0);
      } catch (error) {
        console.error("Failed to load non-covered items:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchNonCoveredItems();
  }, [searchParams, treatmentCategories]);

  // 필터링된 데이터 가져오기
  const fetchFilteredItems = async (
    page = 1,
    customSearchQuery?: string,
    customTreatment?: string
  ) => {
    try {
      setIsLoading(true);

      // API 파라미터 구성
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      // 치료법 필터 - 실제 카테고리명으로 변환
      const treatment = customTreatment ?? selectedTreatment;
      if (treatment && treatment !== "all") {
        const category = treatmentCategories.find(
          (cat) => cat.id === treatment
        );
        if (category) {
          params.append("category", category.searchKeyword);
        }
      }

      // 검색어 필터
      const query = customSearchQuery ?? searchQuery;
      if (query?.trim()) {
        params.append("search", query.trim());
      }

      const url = `/api/nonpayment/items?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(
          `Failed to fetch data: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      setNonCoveredItems(result.data || []);
      setCurrentPage(result.pagination?.currentPage || page);
      setTotalPages(result.pagination?.totalPages || 0);
      setTotalCount(result.pagination?.totalCount || 0);
    } catch (error) {
      console.error("Failed to load filtered items:", error);
      // 에러 시 빈 배열로 설정
      setNonCoveredItems([]);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // URL 업데이트 함수
  const updateURL = (newSearch?: string, newTreatment?: string, newLocation?: string) => {
    const params = new URLSearchParams();
    
    const search = newSearch ?? searchQuery;
    const treatment = newTreatment ?? selectedTreatment;
    const location = newLocation ?? selectedLocation;
    
    if (search && search.trim()) {
      params.set('search', search.trim());
    }
    if (treatment && treatment !== 'chuna') {
      params.set('treatment', treatment);
    }
    if (location && location !== DEFAULT_LOCATION) {
      params.set('location', location);
    }
    
    const newURL = params.toString() ? `/non-covered?${params.toString()}` : '/non-covered';
    router.replace(newURL, { scroll: false });
  };

  const handleTreatmentChange = async (treatment: string) => {
    setSelectedTreatment(treatment);
    updateURL(undefined, treatment);
    await fetchFilteredItems(1, searchQuery, treatment);
  };

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    updateURL(undefined, undefined, location);
    // TODO: 위치 기반 필터링 구현 시 fetchFilteredItems 호출
    console.log("Location changed to:", location);
  };

  const handlePageChange = async (page: number) => {
    if (page < 1) return;
    await fetchFilteredItems(page);
  };

  if (isInitialLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            비급여 데이터를 불러오는 중...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
              한의원 비급여 진료 항목을 찾아보세요
            </h1>
            <p className="text-lg text-muted-foreground">
              치료법별로 분류된 비급여 진료 항목과 가격을 비교해보세요
            </p>
          </div>
        </div>
      </section>

      {/* Treatment Filters Section */}
      <section className="bg-white">
        <div className="max-w-[1200px] mx-auto">
          <TreatmentFilters
            categories={treatmentCategories}
            selectedTreatment={selectedTreatment}
            onTreatmentChange={handleTreatmentChange}
            totalCount={totalCount}
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
          />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <NonCoveredList
            items={nonCoveredItems}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedTreatment={selectedTreatment}
            treatmentCategories={treatmentCategories}
          />

          {/* 페이지네이션 */}
          {!isLoading && nonCoveredItems.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>

              <div className="flex items-center gap-1">
                {totalPages > 0 &&
                  Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(
                      1,
                      Math.min(currentPage - 2, totalPages - 4)
                    );
                    const pageNum = startPage + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-md ${
                          pageNum === currentPage
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}

          {/* 페이지 정보 */}
          {!isLoading && nonCoveredItems.length > 0 && (
            <div className="text-center text-sm text-gray-500 mt-4">
              페이지 {currentPage} / {totalPages} · 총{" "}
              {totalCount.toLocaleString()}개
            </div>
          )}
        </div>
      </section>
    </main>
  );
}