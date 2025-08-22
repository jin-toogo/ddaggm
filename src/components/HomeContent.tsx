"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchBar } from "@/components/SearchBar";
import { FilterDropdowns } from "@/components/FilterDropdowns";
import { ClinicList } from "@/components/ClinicList";
import { Clinic } from "@/types/clinics";
import { loadClinics, cities, districts } from "@/lib/clinics";
import { ITEMS_PER_PAGE } from "@/constants";

export function HomeContent() {
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // URL 파라미터에서 초기 상태 설정
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || "all";
    const district = searchParams.get("district") || "all";

    setSearchQuery(query);
    setSelectedCity(city);
    setSelectedDistrict(district);
  }, [searchParams]);

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        // URL 파라미터가 있으면 해당 값으로 검색, 없으면 기본값
        const query = searchParams.get("q") || undefined;
        const city = searchParams.get("city") || undefined;
        const district = searchParams.get("district") || undefined;

        const data = await loadClinics(
          query,
          city === "all" ? undefined : city,
          district === "all" ? undefined : district,
          1,
          ITEMS_PER_PAGE
        );

        // API 응답이 페이지네이션 정보를 포함하는지 확인
        if (Array.isArray(data)) {
          // 이전 버전 호환성 (배열 반환)
          setClinics(data);
          setTotalCount(data.length);
        } else {
          // 새 버전 (페이지네이션 정보 포함)
          setClinics(data.data || []);
          setCurrentPage(data.pagination?.currentPage || 1);
          setTotalPages(data.pagination?.totalPages || 0);
          setTotalCount(data.pagination?.totalCount || 0);
        }
      } catch (error) {
        console.error("Failed to load clinics:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchClinics();
  }, [searchParams]);

  // 검색/필터 변경 시 데이터 재로드
  const fetchFilteredClinics = async (
    page = 1,
    customSearchQuery?: string,
    customCity?: string,
    customDistrict?: string
  ) => {
    try {
      setIsLoading(true);
      const result = await loadClinics(
        customSearchQuery ?? searchQuery,
        customCity ?? selectedCity,
        customDistrict ?? selectedDistrict,
        page,
        ITEMS_PER_PAGE
      );

      // API 응답이 페이지네이션 정보를 포함하는지 확인
      if (Array.isArray(result)) {
        // 이전 버전 호환성 (배열 반환)
        setClinics(result);
        setCurrentPage(page);
        if (result.length < ITEMS_PER_PAGE) {
          setTotalPages(page);
        } else {
          setTotalPages(page + 1);
        }
        setTotalCount(result.length + (page - 1) * ITEMS_PER_PAGE);
      } else {
        // 새 버전 (페이지네이션 정보 포함)
        setClinics(result.data || []);
        setCurrentPage(result.pagination?.currentPage || page);
        setTotalPages(result.pagination?.totalPages || 0);
        setTotalCount(result.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to load filtered clinics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 정적 도시/구군 데이터 사용 - useMemo 대신 직접 처리
  const getAvailableDistricts = () => {
    const districtData = districts[selectedCity];

    if (!districtData || !Array.isArray(districtData)) {
      console.warn(
        "Invalid district data for",
        selectedCity,
        "returning empty array"
      );
      return [];
    }

    return districtData;
  };

  const availableDistricts = getAvailableDistricts();

  // 페이지네이션 관련 계산
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // 페이지 변경 핸들러
  const handlePageChange = async (page: number) => {
    if (page < 1) return;
    await fetchFilteredClinics(page);
  };

  // URL 업데이트 함수
  const updateURL = (
    newQuery?: string,
    newCity?: string,
    newDistrict?: string
  ) => {
    const params = new URLSearchParams();

    const query = newQuery ?? searchQuery;
    const city = newCity ?? selectedCity;
    const district = newDistrict ?? selectedDistrict;

    if (query && query.trim()) {
      params.set("q", query.trim());
    }
    if (city && city !== "all") {
      params.set("city", city);
    }
    if (district && district !== "all") {
      params.set("district", district);
    }

    const newURL = params.toString() ? `/?${params.toString()}` : "/";
    router.replace(newURL, { scroll: false });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    updateURL(query);
    await fetchFilteredClinics(1, query);
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    updateURL("");
    // 검색어를 빈 상태로 초기 데이터 로드
    const data = await loadClinics(
      undefined,
      undefined,
      undefined,
      1,
      ITEMS_PER_PAGE
    );
    setClinics(data.data);
    setTotalPages(data.pagination.totalPages);
    setTotalCount(data.pagination.totalCount);
    setCurrentPage(1);
  };

  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict("all");
    updateURL(undefined, city, "all");
    await fetchFilteredClinics(1, searchQuery, city, "all");
  };

  const handleDistrictChange = async (district: string) => {
    setSelectedDistrict(district);
    updateURL(undefined, undefined, district);
    await fetchFilteredClinics(1, searchQuery, selectedCity, district);
  };

  if (isInitialLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
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
              한방 첩약 보험 적용 여부를 검색해보세요
            </h1>
            <p className="text-lg text-muted-foreground">
              한의원을 검색하여 한방 첩약 보험 적용 여부를 확인할 수 있습니다
            </p>
          </div>

          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            onClear={handleClearSearch}
          />
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-muted/30 py-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            지역별 한의원 찾기
          </h2>
          <FilterDropdowns
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            onCityChange={handleCityChange}
            onDistrictChange={handleDistrictChange}
            totalCount={totalCount}
            cities={cities}
            districts={availableDistricts}
          />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-xl font-semibold mb-6 text-foreground">
            검색 결과
          </h2>
          <ClinicList
            clinics={clinics}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />

          {/* 페이지네이션 */}
          {!isLoading && clinics.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>

              <div className="flex items-center gap-1">
                {/* 페이지 번호들 */}
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
                disabled={!hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}

          {/* 페이지 정보 */}
          {!isLoading && clinics.length > 0 && (
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
