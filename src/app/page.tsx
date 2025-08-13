"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterDropdowns } from "@/components/FilterDropdowns";
import { ClinicList } from "@/components/ClinicList";
import { Footer } from "@/components/Footer";
import { Clinic } from "@/types/clinics";
import {
  loadClinics,
  filterClinics,
  getCities,
  getDistricts,
} from "@/lib/clinics";

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await loadClinics();
        setClinics(data);
      } catch (error) {
        console.error("Failed to load clinics:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // 도시와 구/군 목록 계산
  const cities = useMemo(() => getCities(clinics), [clinics]);
  const districts = useMemo(
    () => getDistricts(clinics, selectedCity),
    [clinics, selectedCity]
  );

  // 필터링된 한의원 목록
  const filteredClinics = useMemo(() => {
    return filterClinics(clinics, searchQuery, selectedCity, selectedDistrict);
  }, [clinics, searchQuery, selectedCity, selectedDistrict]);

  const displayedClinics = filteredClinics.slice(0, displayedCount);
  const hasMore = displayedCount < filteredClinics.length;

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    setDisplayedCount(ITEMS_PER_PAGE);

    // 검색 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict("all");
    setDisplayedCount(ITEMS_PER_PAGE);
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setDisplayedCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
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
                한의원명으로 보험 적용 여부를 확인하세요
              </h1>
              <p className="text-lg text-muted-foreground">
                한의원명을 입력하여 한방 첩약 보험 적용 여부를 확인할 수
                있습니다
              </p>
            </div>

            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
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
              totalCount={filteredClinics.length}
              cities={cities}
              districts={districts}
            />
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <ClinicList
              clinics={displayedClinics}
              isLoading={isLoading}
              searchQuery={searchQuery}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
