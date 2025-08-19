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
  cities,
  districts,
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

  // 검색/필터 변경 시 데이터 재로드
  const fetchFilteredClinics = async () => {
    try {
      setIsLoading(true);
      const data = await loadClinics(searchQuery, selectedCity, selectedDistrict);
      setClinics(data);
      setDisplayedCount(ITEMS_PER_PAGE);
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

  // 데이터가 서버에서 필터링되므로 clinics 그대로 사용
  const displayedClinics = clinics.slice(0, displayedCount);
  const hasMore = displayedCount < clinics.length;

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchFilteredClinics();
  };

  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict("all");
    // fetchFilteredClinics에서 selectedCity와 selectedDistrict를 참조하므로 
    // state 업데이트 후에 호출해야 함
    setTimeout(async () => {
      const data = await loadClinics(searchQuery, city, "all");
      setClinics(data);
      setDisplayedCount(ITEMS_PER_PAGE);
    }, 0);
  };

  const handleDistrictChange = async (district: string) => {
    setSelectedDistrict(district);
    setTimeout(async () => {
      const data = await loadClinics(searchQuery, selectedCity, district);
      setClinics(data);
      setDisplayedCount(ITEMS_PER_PAGE);
    }, 0);
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
                한방 첩약 보험 적용 여부를 검색해보세요
              </h1>
              <p className="text-lg text-muted-foreground">
                한의원을 검색하여 한방 첩약 보험 적용 여부를 확인할 수 있습니다
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
              totalCount={clinics.length}
              cities={cities}
              districts={availableDistricts}
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
