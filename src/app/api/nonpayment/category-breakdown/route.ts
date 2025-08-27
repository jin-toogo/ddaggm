import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "500");

    // 모든 카테고리 데이터 가져오기
    const allCategories = await prisma.hospitalNonPaymentItem.findMany({
      select: {
        category: true,
        id: true,
      },
      where: {
        category: {
          not: null,
        },
      },
    });

    // 카테고리를 '/' 기준으로 분해하고 카운트
    const categoryBreakdown = new Map<string, number>();

    allCategories.forEach((item) => {
      if (item.category) {
        // '/' 기준으로 분해
        const splitCategories = item.category
          .split("/")
          .map((cat) => cat.trim()) // 앞뒤 공백 제거
          .filter((cat) => cat.length > 0); // 빈 문자열 제거

        // 각 분해된 카테고리별로 카운트 증가
        splitCategories.forEach((splitCat) => {
          const currentCount = categoryBreakdown.get(splitCat) || 0;
          categoryBreakdown.set(splitCat, currentCount + 1);
        });
      }
    });

    // Map을 배열로 변환하고 카운트순으로 정렬
    const sortedBreakdown = Array.from(categoryBreakdown.entries())
      .map(([category, count], index) => ({
        rank: index + 1,
        category: category,
        count: count,
        percentage: ((count / allCategories.length) * 100).toFixed(2),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    // 원본 카테고리 예시들도 함께 제공
    const categoryExamples = new Map<string, Set<string>>();

    allCategories.forEach((item) => {
      if (item.category) {
        const splitCategories = item.category
          .split("/")
          .map((cat) => cat.trim())
          .filter((cat) => cat.length > 0);

        splitCategories.forEach((splitCat) => {
          if (!categoryExamples.has(splitCat)) {
            categoryExamples.set(splitCat, new Set());
          }
          if (item.category) {
            categoryExamples.get(splitCat)?.add(item.category);
          }
        });
      }
    });

    // 예시를 포함한 최종 결과
    const finalResults = sortedBreakdown.map((item) => ({
      ...item,
      examples: Array.from(categoryExamples.get(item.category) || []).slice(
        0,
        10
      ), // 상위 3개 예시만
    }));

    return NextResponse.json({
      data: finalResults,
      total: finalResults.length,
      totalOriginalCategories: allCategories.length,
      summary: {
        mostCommon: finalResults[0]?.category || null,
        totalUniqueBreakdownCategories: categoryBreakdown.size,
      },
    });
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch category breakdown" },
      { status: 500 }
    );
  }
}
