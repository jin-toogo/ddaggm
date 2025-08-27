import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const q = searchParams.get("q"); // 검색어
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const province = searchParams.get("province");
    const district = searchParams.get("district");
    const type = searchParams.get("type");
    const insurance = searchParams.get("insurance");

    const skip = (page - 1) * limit;

    if (!q) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // 검색 조건 구성
    const where: any = {
      OR: [
        {
          name: {
            contains: q,
          },
        },
        {
          address: {
            contains: q,
          },
        },
      ],
    };

    // 추가 필터 적용
    if (province) {
      where.province = province;
    }

    if (district) {
      where.district = district;
    }

    if (type) {
      where.type = {
        contains: type,
      };
    }

    if (insurance !== null && insurance !== undefined) {
      where.insurance = insurance === "true";
    }

    // 검색 결과 조회
    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        include: {
          locationDetails: true,
          operatingHours: true,
        },
        skip,
        take: limit,
        orderBy: [
          {
            name: "asc",
          },
        ],
      }),
      prisma.hospital.count({ where }),
    ]);

    return NextResponse.json({
      data: hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      query: q,
    });
  } catch (error) {
    console.error("Hospital Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
