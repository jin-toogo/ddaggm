import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // category 고유값 추출
    const categories = await prisma.hospitalNonPaymentItem.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        category: {
          not: null,
        },
      },
      orderBy: {
        category: 'asc',
      },
    });

    // null이 아닌 category만 필터링하고 문자열 배열로 변환
    const categoryList = categories
      .map(item => item.category)
      .filter((category): category is string => category !== null)
      .sort();

    return NextResponse.json({
      categories: categoryList,
      count: categoryList.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}