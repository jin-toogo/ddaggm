import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const province = searchParams.get("province");
    const district = searchParams.get("district");
    const type = searchParams.get("type");
    const insurance = searchParams.get("insurance");

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

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

    // 병원 목록 조회
    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        include: {
          locationDetails: true,
          operatingHours: true,
        },
        skip,
        take: limit,
        orderBy: {
          name: "asc",
        },
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
    });
  } catch (error) {
    console.error("Hospital API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
