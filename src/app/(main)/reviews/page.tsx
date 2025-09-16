"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MapPin, Calendar, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { NaverBlogIconSmall } from "@/components/ui/naver-blog-icon";
import { useAuth } from "@/hooks/useAuth";
import { LoginPromptOverlay } from "@/components/auth/LoginPromptOverlay";

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

function ReviewsContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<
    ReviewsData["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // 로그인 상태에 따른 표시할 포스트 계산 (메모화)
  const displayPosts = useMemo(() => {
    return user ? posts : posts.slice(0, 10);
  }, [user, posts]);

  const shouldShowLoginPrompt = useMemo(() => {
    return !user && posts.length > 10;
  }, [user, posts.length]);

  // URL 파라미터에서 초기 상태 설정
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    setSearchQuery(query);
    setSelectedCategory(category);
    setCurrentPage(page);
  }, [searchParams]);

  // 초기 데이터 로딩 - URL 파라미터 반영
  useEffect(() => {
    if (!authLoading) {
      fetchReviews(currentPage);
    }
  }, [currentPage, selectedCategory, searchQuery, user, authLoading]);

  // URL 업데이트 함수
  const updateURL = (
    newQuery?: string,
    newCategory?: string,
    newPage?: number
  ) => {
    const params = new URLSearchParams();

    const query = newQuery ?? searchQuery;
    const category = newCategory ?? selectedCategory;
    const page = newPage ?? currentPage;

    if (query && query.trim()) {
      params.set("q", query.trim());
    }
    if (category) {
      params.set("category", category);
    }
    if (page > 1) {
      params.set("page", page.toString());
    }

    const newURL = params.toString()
      ? `/reviews?${params.toString()}`
      : "/reviews";
    router.replace(newURL, { scroll: false });
  };

  const fetchReviews = async (page = 1) => {
    setIsLoading(true);
    try {
      // 비로그인 사용자는 첫 페이지만 더 많은 데이터 가져오기
      const limit = user ? "12" : "15";
      const params = new URLSearchParams({
        page: page.toString(),
        limit,
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery);
      }

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
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

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    updateURL(undefined, undefined, 1);
    fetchReviews(1);
  }, [searchQuery, selectedCategory, user]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  }, []);

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
          에디터들이 선별한 찐으로 도움되는 후기들을 확인해보세요.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6 py-0">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="한의원명이나 리뷰 내용을 검색하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
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
                  updateURL(undefined, "", 1);
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
                    updateURL(undefined, category, 1);
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
            {displayPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={(e) => {
                  e.preventDefault();
                  if (user) {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
                    window.open(
                      `${baseUrl}/reviews/${post.id}?link=${post.originalUrl}`,
                      "_blank"
                    );
                  } else {
                    setShowLoginPrompt(true);
                  }
                }}
                className={`overflow-hidden transition-shadow border-b border-gray-200 py-8 cursor-pointer hover:bg-gray-50 ${
                  !user && index === 9 ? "relative" : ""
                }`}
              >
                <div className="flex md:flex-row flex-col gap-5">
                  {post.imageUrl && (
                    <div className="md:w-[220px] w-full  flex-shrink-0">
                      <div className="w-full h-full overflow-hidden rounded-lg">
                        <img
                          src={`/api/proxy/image?url=${encodeURIComponent(
                            post.imageUrl
                          )}&postId=${encodeURIComponent(post.id)}`}
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
                            router.push(`/hospital/${post.hospital.id}`);
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
                {/* 10번째 포스트에 블러 효과 */}
                {!user && index === 9 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white pointer-events-none">
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-center"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 로그인 유도 메시지 - 비로그인 사용자만 */}
          {shouldShowLoginPrompt && (
            <div className="text-center mb-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="animate-in zoom-in-95 duration-700 delay-200">
                  <p className="text-blue-800 font-medium mb-3 text-base sm:text-lg">
                    🔒 더 많은 후기를 보려면 로그인이 필요합니다
                  </p>
                  <p className="text-blue-600 text-sm sm:text-base mb-4">
                    100+ 선별된 한의원 후기를 무제한으로 확인해보세요!
                  </p>
                  <Button
                    onClick={() => setShowLoginPrompt(true)}
                    className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
                    size="lg"
                  >
                    로그인하고 더 보기
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 페이지네이션 - 로그인한 사용자만 */}
          {user && pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                  updateURL(undefined, undefined, newPage);
                }}
                disabled={currentPage <= 1}
              >
                이전
              </Button>

              <span className="px-4 py-2 text-sm">
                {currentPage} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => {
                  const newPage = Math.min(
                    pagination.totalPages,
                    currentPage + 1
                  );
                  setCurrentPage(newPage);
                  updateURL(undefined, undefined, newPage);
                }}
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

      {/* 로그인 프롬프트 오버레이 */}
      <LoginPromptOverlay
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        totalReviews={100}
        showReviews={10}
      />
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      }
    >
      <ReviewsContent />
    </Suspense>
  );
}
