"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 카테고리 목록 (DB와 매칭)

const categories = [
  "전체",
  "여성건강",
  "수면개선",
  "면역개선",
  "혈당관리",
  "소화개선",
  "관절개선",
  "다이어트",
  "간건강",
];

interface HerbalProduct {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  brand: string;
  url: string;
  image: string;
}

export default function HerbalSupplementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [herbalProducts, setHerbalProducts] = useState<HerbalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 데이터베이스에서 제품 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/herbal-products");
        if (response.ok) {
          const products = await response.json();
          setHerbalProducts(products);
        } else {
          console.error("제품 로드 실패:", response.statusText);
        }
      } catch (error) {
        console.error("제품 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductClick = (product: HerbalProduct) => {
    // 동적 라우트로 이동 (reviews 패턴과 동일)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const params = new URLSearchParams({
      link: product.url,
      productId: product.id.toString(),
      name: product.name,
      category: product.category,
      brand: product.brand,
    });

    window.open(
      `${baseUrl}/herbal-supplements/${product.id}?${params.toString()}`,
      "_blank"
    );
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.trim()) {
      try {
        // 데이터베이스에 피드백 저장
        const response = await fetch("/api/herbal-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: feedback.trim() }),
        });

        if (response.ok) {
          // 피드백 트래킹 (GA4 이벤트)
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "herbal_feedback_submit", {
              feedback_content: feedback,
              page: "herbal_supplements",
            });
          }

          alert("소중한 의견 감사합니다! 더 나은 서비스로 찾아오겠습니다.");
          setFeedback("");
          setShowFeedback(false);
        } else {
          alert("피드백 저장에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        console.error("피드백 저장 실패:", error);
        alert("피드백 저장에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const filteredProducts =
    selectedCategory === "전체"
      ? herbalProducts
      : herbalProducts.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <div className="min-h-screen">
      <StructuredData type="herbal-supplements" />

      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto ">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            한방건기식 추천
          </h1>
          <p className="text-gray-600 text-lg">
            검증된 한방건기식 제품들을 한 곳에서 비교해보세요
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto pb-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">제품 정보를 불러오는 중...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedCategory === "전체"
                ? "등록된 제품이 없습니다"
                : `'${selectedCategory}' 카테고리에 제품이 없습니다`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-lg px-4 py-2 transition-shadow cursor-pointer pt-0 overflow-hidden border-none rounded-none shadow-none"
              >
                <div onClick={() => handleProductClick(product)}>
                  <div className="aspect-auto bg-gray-100  overflow-hidden mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="px-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-normal">
                        {product.name}
                      </CardTitle>
                    </div>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-rows items-center gap-1">
                        <p className="font-semibold text-blue-600">
                          {product.price}
                        </p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="max-w-6xl mx-auto pb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            💬 어떤 한방건기식에 관심이 있으신가요?
          </h3>

          {!showFeedback ? (
            <Button
              onClick={() => setShowFeedback(true)}
              className="w-full sm:w-auto"
            >
              의견 남기기
            </Button>
          ) : (
            <div className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="예: 갱년기에 좋은 제품이 있으면 좋겠어요, 가격대가 더 다양했으면 좋겠어요..."
                className="w-full p-3 border rounded-lg h-24 resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={handleFeedbackSubmit}>의견 제출</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(false)}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
