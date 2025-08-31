"use client";

import React, { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import CategoryGrid from "@/components/CategoryGrid";
import { StructuredData } from "@/components/StructuredData";
import { NonCoveredList } from "@/components/NonCoveredList";
import { ClinicList } from "@/components/ClinicList";
import { NonCoveredItem, Clinic } from "@/types";
import { treatmentCategories, loadClinics } from "@/lib/clinics";
import Link from "next/link";

export default function HomePage() {
  const [nonCoveredItems, setNonCoveredItems] = useState<NonCoveredItem[]>([]);
  const [herbalClinics, setHerbalClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHerbalLoading, setIsHerbalLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 비급여 인기 항목 가져오기
        const nonCoveredResponse = await fetch(
          `/api/nonpayment/items?page=1&limit=5&category=%EC%B6%94%EB%82%98&sortBy=price_asc`
        );
        if (nonCoveredResponse.ok) {
          const nonCoveredData = await nonCoveredResponse.json();
          setNonCoveredItems(nonCoveredData.data || []);
        }

        // 한방 첩약 보험 적용 한의원 가져오기
        setIsHerbalLoading(true);
        const herbalData = await loadClinics(
          undefined,
          undefined,
          undefined,
          1,
          5
        );
        if (herbalData && herbalData.clinics) {
          setHerbalClinics(herbalData.clinics);
        }
        setIsHerbalLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="">
      <StructuredData type="non-payment" />

      {/* Category Grid Section */}
      <CategoryGrid />

      {/* 비급여 진료 섹션 */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              인기 비급여 진료 항목
            </h2>
            <p className="text-gray-600 max-sm:hidden">
              많은 분들이 찾는 한의원 비급여 진료를 확인해보세요
            </p>
          </div>
          <Link
            href="/non-covered"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            전체보기
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* NonCoveredList 컴포넌트 사용 */}
        <NonCoveredList
          items={nonCoveredItems.slice(0, 6)}
          isLoading={isLoading}
          searchQuery=""
          selectedTreatment="all"
          treatmentCategories={treatmentCategories}
        />
      </section>

      {/* 한방 첩약 보험 섹션 */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              한방 첩약 보험 적용 한의원
            </h2>
            <p className="text-gray-600 max-sm:hidden">
              실손보험으로 첩약 치료를 받을 수 있는 한의원을 찾아보세요
            </p>
          </div>
          <Link
            href="/herbal-insurance"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            전체보기
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* ClinicList 컴포넌트 사용 */}
        <ClinicList
          clinics={herbalClinics}
          isLoading={isHerbalLoading}
          searchQuery=""
        />
      </section>

      <Footer />
    </div>
  );
}
