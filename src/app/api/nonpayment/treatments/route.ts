import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

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

    // treatmentName 고유값 추출
    const treatments = await prisma.hospitalNonPaymentItem.findMany({
      select: {
        treatmentName: true,
        category: true,
      },
      distinct: ["treatmentName"],
      where,
      orderBy: {
        treatmentName: "asc",
      },
      skip,
      take: limit,
    });

    // 총 개수 조회
    const totalCount = await prisma.hospitalNonPaymentItem.count({
      where,
    });

    // null이 아닌 treatmentName만 필터링
    const treatmentList = treatments
      .map((item) => ({
        treatmentName: item.treatmentName,
        category: item.category,
      }))
      .filter((item) => item.treatmentName !== null);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: treatmentList,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { error: "Failed to fetch treatments" },
      { status: 500 }
    );
  }
}
