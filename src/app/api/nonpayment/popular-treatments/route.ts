import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");

    // 필터 조건
    const where: any = {
      treatmentName: {
        not: null,
      },
    };

    // category로 필터링 (선택사항)
    if (category) {
      where.category = category;
    }

    // treatmentName별로 그룹화해서 개수 세기
    const popularTreatments = await prisma.hospitalNonPaymentItem.groupBy({
      by: ['treatmentName', 'category'],
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
      where,
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    // 결과 포맷팅
    const formattedResults = popularTreatments.map((treatment, index) => ({
      rank: index + 1,
      treatmentName: treatment.treatmentName,
      category: treatment.category,
      hospitalCount: treatment._count.id,
      averageAmount: treatment._avg.amount,
      minAmount: treatment._min.amount,
      maxAmount: treatment._max.amount,
    }));

    return NextResponse.json({
      data: formattedResults,
      total: formattedResults.length,
      category: category || "전체",
    });
  } catch (error) {
    console.error("Error fetching popular treatments:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular treatments" },
      { status: 500 }
    );
  }
}