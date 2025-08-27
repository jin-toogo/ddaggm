import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetCategory = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!targetCategory) {
      return NextResponse.json(
        { error: "category parameter is required" },
        { status: 400 }
      );
    }

    // 해당 카테고리를 포함하는 모든 데이터 조회
    const matchingItems = await prisma.hospitalNonPaymentItem.findMany({
      select: {
        category: true,
        treatmentName: true,
        amount: true,
        id: true,
      },
      where: {
        category: {
          contains: targetCategory,
          not: null,
        },
        treatmentName: {
          not: null,
        },
      },
    });

    // 정확히 해당 카테고리를 포함하는 항목들만 필터링
    const exactMatches = matchingItems.filter((item) => {
      if (!item.category) return false;
      const splitCategories = item.category
        .split("/")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);
      return splitCategories.includes(targetCategory);
    });

    // 원본 카테고리별로 그룹화
    const originalCategoryStats = new Map<
      string,
      {
        count: number;
        treatments: Set<string>;
        amounts: number[];
      }
    >();

    exactMatches.forEach((item) => {
      if (!item.category) return;

      if (!originalCategoryStats.has(item.category)) {
        originalCategoryStats.set(item.category, {
          count: 0,
          treatments: new Set(),
          amounts: [],
        });
      }

      const stats = originalCategoryStats.get(item.category)!;
      stats.count++;
      if (item.treatmentName) {
        stats.treatments.add(item.treatmentName);
      }
      if (item.amount) {
        stats.amounts.push(Number(item.amount));
      }
    });

    // 결과 포맷팅
    const categoryDetails = Array.from(originalCategoryStats.entries())
      .map(([category, stats]) => {
        const amounts = stats.amounts;
        const avgAmount =
          amounts.length > 0
            ? amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
            : null;

        return {
          originalCategory: category,
          itemCount: stats.count,
          uniqueTreatments: stats.treatments.size,
          treatmentNames: Array.from(stats.treatments).slice(0, 5), // 상위 5개만
          averageAmount: avgAmount,
          minAmount: amounts.length > 0 ? Math.min(...amounts) : null,
          maxAmount: amounts.length > 0 ? Math.max(...amounts) : null,
        };
      })
      .sort((a, b) => b.itemCount - a.itemCount)
      .slice(0, limit);

    // 전체 통계
    const totalItems = exactMatches.length;
    const uniqueTreatments = new Set(
      exactMatches.map((item) => item.treatmentName).filter(Boolean)
    );
    const allAmounts = exactMatches
      .map((item) => item.amount)
      .filter(Boolean)
      .map(Number);
    const overallAverage =
      allAmounts.length > 0
        ? allAmounts.reduce((sum, amt) => sum + amt, 0) / allAmounts.length
        : null;

    return NextResponse.json({
      searchCategory: targetCategory,
      summary: {
        totalMatchingItems: totalItems,
        uniqueOriginalCategories: categoryDetails.length,
        totalUniqueTreatments: uniqueTreatments.size,
        overallAverageAmount: overallAverage,
      },
      categoryDetails,
    });
  } catch (error) {
    console.error("Error fetching category details:", error);
    return NextResponse.json(
      { error: "Failed to fetch category details" },
      { status: 500 }
    );
  }
}
