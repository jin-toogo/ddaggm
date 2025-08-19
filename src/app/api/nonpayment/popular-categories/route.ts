import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // category별로 그룹화해서 개수 및 통계 계산
    const popularCategories = await prisma.hospitalNonPaymentItem.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      _avg: {
        amount: true,
      },
      _min: {
        amount: true,
      },
      _max: {
        amount: true,
      },
      where: {
        category: {
          not: null,
        },
        amount: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    // 각 카테고리별 고유 treatmentName 개수도 조회
    const categoryWithTreatmentCounts = await Promise.all(
      popularCategories.map(async (category) => {
        const uniqueTreatments = await prisma.hospitalNonPaymentItem.findMany({
          select: { treatmentName: true },
          distinct: ['treatmentName'],
          where: {
            category: category.category,
            treatmentName: { not: null },
          },
        });

        return {
          rank: popularCategories.indexOf(category) + 1,
          category: category.category,
          totalItems: category._count.id,
          uniqueTreatments: uniqueTreatments.length,
          averageAmount: category._avg.amount,
          minAmount: category._min.amount,
          maxAmount: category._max.amount,
        };
      })
    );

    return NextResponse.json({
      data: categoryWithTreatmentCounts,
      total: categoryWithTreatmentCounts.length,
    });
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular categories" },
      { status: 500 }
    );
  }
}