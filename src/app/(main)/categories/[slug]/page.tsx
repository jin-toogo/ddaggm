"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface Clinic {
  id: number;
  name: string;
  type: string;
  address: string;
  phone: string | null;
  website: string | null;
  province: string;
  district: string;
  insurance?: boolean;
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch("/api/categories");

    if (!response.ok) return null;

    const data = await response.json();
    return data.categories.find((cat: Category) => cat.slug === slug) || null;
  } catch {
    return null;
  }
}

async function getClinicsForCategory(
  slug: string,
  page = 1,
  limit = 10
): Promise<{
  clinics: Clinic[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}> {
  try {
    const response = await fetch(
      `/api/categories/${slug}/clinics?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      return {
        clinics: [],
        pagination: { page: 1, totalPages: 1, total: 0, limit },
      };
    }

    return await response.json();
  } catch {
    return {
      clinics: [],
      pagination: { page: 1, totalPages: 1, total: 0, limit },
    };
  }
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = React.use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log("resolvedParams :>> ", resolvedParams);
      // Get category data
      const categoryData = await getCategory(resolvedParams.slug);
      if (!resolvedParams.slug) {
        setError("카테고리를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      setCategory(categoryData);
      console.log("categoryData :>> ", categoryData);
      // Get clinics for category
      const clinicsData = await getClinicsForCategory(
        resolvedParams.slug,
        1,
        10
      );
      console.log("clinicsData :>> ", clinicsData);
      setClinics(clinicsData.clinics);
      setPagination(clinicsData.pagination);

      setIsLoading(false);
    };

    fetchData();
  }, [resolvedParams.slug]);

  const handlePageChange = async (newPage: number) => {
    if (!category) return;

    setIsLoading(true);
    const clinicsData = await getClinicsForCategory(
      resolvedParams.slug,
      newPage,
      pagination.limit
    );
    setClinics(clinicsData.clinics);
    setPagination(clinicsData.pagination);
    setIsLoading(false);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">오류 발생</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return notFound();
  }

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          홈으로 돌아가기
        </Link>
      </div>

      {/* Category Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
      </div>

      {/* Content */}
      <div>
        {clinics.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              등록된 한의원이 없습니다
            </h3>
            <p className="text-gray-500">
              아직 이 카테고리에 등록된 한의원이 없습니다.
            </p>
          </div>
        ) : (
          <>
            {/* Clinic Cards */}
            <div className="grid gap-6">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {clinic.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="secondary">{clinic.type}</Badge>
                        {clinic.insurance && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            보험 적용
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{clinic.address}</span>
                    </div>

                    {clinic.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <a
                          href={`tel:${clinic.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {clinic.phone}
                        </a>
                      </div>
                    )}

                    {clinic.website && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          홈페이지 방문
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {clinic.province} {clinic.district}
                      </div>
                      <Link
                        href={`/hospital/${clinic.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        상세보기 →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                  className="p-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      const current = pagination.page;
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= current - 2 && page <= current + 2)
                      );
                    })
                    .map((page, index, array) => {
                      const prev = array[index - 1];
                      return (
                        <React.Fragment key={page}>
                          {prev && page - prev > 1 && (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            disabled={isLoading}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              page === pagination.page
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    pagination.page === pagination.totalPages || isLoading
                  }
                  className="p-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
