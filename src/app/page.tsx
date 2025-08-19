"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterDropdowns } from "@/components/FilterDropdowns";
import { ClinicList } from "@/components/ClinicList";
import { Footer } from "@/components/Footer";
import { Clinic } from "@/types/clinics";
import { loadClinics, cities, districts } from "@/lib/clinics";

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await loadClinics();
        // 초기 로딩시에는 전체 데이터 반환 (배열)

        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        setClinics(data.data);
      } catch (error) {
        console.error("Failed to load clinics:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // 검색/필터 변경 시 데이터 재로드
  const fetchFilteredClinics = async (page = 1, customSearchQuery?: string, customCity?: string, customDistrict?: string) => {
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
        setClinics(result.data);
        setCurrentPage(result.pagination.currentPage);
        setTotalPages(result.pagination.totalPages);
        setTotalCount(result.pagination.totalCount);
      }
    } catch (error) {
      console.error("Failed to load filtered clinics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 정적 도시/구군 데이터 사용
  const availableDistricts = useMemo(() => {
    if (selectedCity === "all") return [];
    return districts[selectedCity] || [];
  }, [selectedCity]);

  // 페이지네이션 관련 계산
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // 페이지 변경 핸들러
  const handlePageChange = async (page: number) => {
    if (page < 1) return;
    await fetchFilteredClinics(page);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchFilteredClinics(1, query);
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    // 검색어를 비운 상태로 초기 데이터 로드
    const data = await loadClinics();
    setClinics(data.data);
    setTotalPages(data.pagination.totalPages);
    setTotalCount(data.pagination.totalCount);
    setCurrentPage(1);
  };

  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict("all");
    setTimeout(async () => {
      await fetchFilteredClinics(1, searchQuery, city, "all");
    }, 0);
  };

  const handleDistrictChange = async (district: string) => {
    setSelectedDistrict(district);
    setTimeout(async () => {
      await fetchFilteredClinics(1, searchQuery, selectedCity, district);
    }, 0);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

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

      <Footer />
    </div>
  );
}
