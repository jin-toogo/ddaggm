"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MapPin, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { NaverBlogIconSmall } from "@/components/ui/naver-blog-icon";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  originalUrl: string;
  publishedAt: string;
  author: string;
  clinicName?: string;
  clinicAddress?: string;
  categories: string[];
  tags: string[];
  hospital?: {
    id: number;
    name: string;
    address: string;
    province: string;
    district: string;
  };
}

interface ReviewsData {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ReviewsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<
    ReviewsData["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage, selectedCategory]);

  const fetchReviews = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery);
      }

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      console.log("data :>> ", data);
      if (data.success) {
        setPosts(data.data.posts);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReviews(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const categories = [
    "일반",
    "침구",
    "한약",
    "추나",
    "다이어트",
    "미용",
    "임신",
  ];

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">한의원 후기</h1>
        <p className="text-muted-foreground">
          실제 환자들의 한의원 방문 후기를 확인해보세요.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="한의원명이나 리뷰 내용을 검색하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  onClick={handleSearch}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  검색
                </Button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory("");
                  setCurrentPage(1);
                }}
              >
                전체
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* 리뷰 카드 그리드 */}
      {!isLoading && posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 mb-8">
            {posts.map((post) => (
              <a
                href={post.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                key={post.id}
                className="overflow-hidden transition-shadow border-b border-gray-200 py-8"
              >
                <div className="flex md:flex-row flex-col gap-5">
                  {post.imageUrl && (
                    <div className="md:w-[220px] w-full  flex-shrink-0">
                      <div className="w-full h-full overflow-hidden rounded-lg">
                        <img
                          src={`/api/proxy/image?url=${encodeURIComponent(
                            post.imageUrl
                          )}`}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <CardContent className="px-0">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-lg">
                      {post.title}
                    </h3>
                    <p className="text-sm  mb-3 line-clamp-4 leading-6">
                      {post.summary || post.content.substring(0, 150) + "..."}
                    </p>

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pt-3">
                      {/* 카테고리 태그 */}
                      <div className="flex flex-wrap gap-1">
                        {post.categories.map((category, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* naver blog 출처 */}
                        <NaverBlogIconSmall className="mr-1" />
                        <User className="h-3 w-3" />
                        {post.author} &nbsp;
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </div>
                    </div>

                    {/* 한의원 정보 */}
                    {post.hospital && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (post.hospital && post.hospital.id) {
                            router.push(`/hospitals/${post.hospital.id}`);
                          }
                        }}
                        className="w-full cursor-pointer b-3 p-2 bg-green-50 rounded-lg flex items-center gap-1 mb-1"
                      >
                        <MapPin className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {post.hospital.name}
                        </span>

                        <p className="text-xs text-green-600">
                          {post.hospital.province} {post.hospital.district}
                        </p>
                      </button>
                    )}
                    {/* 원본 링크 */}
                    {/* <Button asChild className="w-full" size="sm">
                      <a
                        href={post.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 justify-center"
                      >
                        <ExternalLink className="h-4 w-4" />
                        원본 블로그 보기
                      </a>
                    </Button> */}
                  </CardContent>
                </div>
              </a>
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                이전
              </Button>

              <span className="px-4 py-2 text-sm">
                {currentPage} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={currentPage >= pagination.totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      {/* 빈 상태 */}
      {!isLoading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || selectedCategory ? (
              <p>검색 조건에 맞는 리뷰가 없습니다.</p>
            ) : (
              <p>아직 등록된 리뷰가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
