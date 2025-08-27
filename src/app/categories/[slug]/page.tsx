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
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

interface PaginationData {
  clinics: Clinic[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
  };
}

async function getClinics(
  categorySlug: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginationData> {
  try {
    const response = await fetch(
      `/api/clinics?category=${categorySlug}&page=${page}&limit=${limit}`
    );

    if (!response.ok)
      return {
        clinics: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          itemsPerPage: limit,
        },
      };

    const data = await response.json();
    return {
      clinics: data.clinics || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        itemsPerPage: limit,
      },
    };
  } catch {
    return {
      clinics: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        itemsPerPage: limit,
      },
    };
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default function CategoryPage({ params, searchParams }: PageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    itemsPerPage: 20,
  });
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const router = useRouter();
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;

      setSlug(resolvedParams.slug);
      setCurrentPage(parseInt(resolvedSearchParams?.page || "1"));
    };

    initializeParams();
  }, [params, searchParams]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);

      const categoryData = await getCategory(slug);
      if (!categoryData) {
        notFound();
        return;
      }

      setCategory(categoryData);

      const { clinics: clinicData, pagination: paginationData } =
        await getClinics(slug, currentPage);
      setClinics(clinicData);
      setPagination(paginationData);

      setLoading(false);
    };

    fetchData();
  }, [slug, currentPage]);

  if (loading || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <div className="space-y-6 ">
            {clinics.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => {
                  router.push(`/hospital/${clinic.id}`);
                }}
                className="cursor-pointer block w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {clinic.name}
                    </div>

                    {clinic.insurance ? (
                      <Badge
                        variant="outline"
                        className="text-green-800 border-green-50 bg-green-50 my-1 ml-2"
                      >
                        한방 첩약 보험 가능
                      </Badge>
                    ) : null}
                  </div>

                  <div className="text-sm text-gray-500">
                    {clinic.province} {clinic.district}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">{clinic.address}</span>
                  </div>

                  {clinic.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <a
                        href={`tel:${clinic.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {clinic.phone}
                      </a>
                    </div>
                  )}

                  {clinic.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-3" />
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        홈페이지 방문하기
                      </a>
                    </div>
                  )}
                </div>
              </button>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8 pt-8 border-t border-gray-200">
                <Link
                  href={`/categories/${slug}${
                    pagination.hasPrevPage
                      ? `?page=${pagination.currentPage - 1}`
                      : ""
                  }`}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pagination.hasPrevPage
                      ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                  }`}
                  {...(!pagination.hasPrevPage && { "aria-disabled": true })}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  이전
                </Link>

                <div className="flex space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      const isCurrentPage = pageNum === pagination.currentPage;

                      return (
                        <Link
                          key={pageNum}
                          href={`/categories/${slug}?page=${pageNum}`}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            isCurrentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    }
                  )}
                </div>

                <Link
                  href={`/categories/${slug}${
                    pagination.hasNextPage
                      ? `?page=${pagination.currentPage + 1}`
                      : ""
                  }`}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pagination.hasNextPage
                      ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                  }`}
                  {...(!pagination.hasNextPage && { "aria-disabled": true })}
                >
                  다음
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
