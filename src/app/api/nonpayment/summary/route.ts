import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // category별 treatmentName 개수와 평균 금액
    const categoryStats = await prisma.hospitalNonPaymentItem.groupBy({
      by: ["category"],
      _count: {
        treatmentName: true,
      },
      _avg: {
        amount: true,
      },
      where: {
        category: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          treatmentName: "desc",
        },
      },
    });

    // 전체 통계
    const totalStats = await prisma.hospitalNonPaymentItem.aggregate({
      _count: {
        id: true,
        category: true,
        treatmentName: true,
      },
      _avg: {
        amount: true,
      },
      where: {
        category: {
          not: null,
        },
        treatmentName: {
          not: null,
        },
      },
    });

    // 고유한 category 개수
    const uniqueCategories = await prisma.hospitalNonPaymentItem.findMany({
      select: { category: true },
      distinct: ["category"],
      where: {
        category: {
          not: null,
        },
      },
    });

    // 고유한 treatmentName 개수
    const uniqueTreatments = await prisma.hospitalNonPaymentItem.findMany({
      select: { treatmentName: true },
      distinct: ["treatmentName"],
      where: {
        treatmentName: {
          not: null,
        },
      },
    });

    const summary = {
      overview: {
        totalItems: totalStats._count.id,
        uniqueCategories: uniqueCategories.length,
        uniqueTreatments: uniqueTreatments.length,
        averageAmount: totalStats._avg.amount,
      },
      categoryBreakdown: categoryStats.map((stat) => ({
        category: stat.category,
        treatmentCount: stat._count.treatmentName,
        averageAmount: stat._avg.amount,
      })),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching nonpayment summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch nonpayment summary" },
      { status: 500 }
    );
  }
}
