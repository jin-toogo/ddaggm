import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 실제 치료명 샘플 조회
    const treatments = await prisma.hospitalNonPaymentItem.findMany({
      select: {
        treatmentName: true,
        category: true,
      },
      where: {
        treatmentName: { not: null },
      },
      take: 50,
      orderBy: {
        treatmentName: 'asc',
      },
    });

    // 카테고리별 그룹화
    const categories = await prisma.hospitalNonPaymentItem.groupBy({
      by: ['category'],
      where: {
        category: { not: null },
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 20,
    });

    return NextResponse.json({
      sampleTreatments: treatments,
      topCategories: categories,
    });
  } catch (error) {
    console.error("Debug API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}