import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseInt(searchParams.get("radius") || "5"); // km 단위
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const insurance = searchParams.get("insurance");

    const skip = (page - 1) * limit;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // 기본 필터 조건
    const additionalWhere: any = {};

    if (type) {
      additionalWhere.type = {
        contains: type,
      };
    }

    if (insurance !== null && insurance !== undefined) {
      additionalWhere.insurance = insurance === "true";
    }

    // Raw SQL을 사용한 거리 계산
    const hospitals = await prisma.$queryRawUnsafe(
      `
      SELECT 
        h.*,
        (6371 * acos(cos(radians(?)) * cos(radians(h.latitude)) * 
         cos(radians(h.longitude) - radians(?)) + 
         sin(radians(?)) * sin(radians(h.latitude)))) AS distance
      FROM hospitals h
      WHERE h.latitude IS NOT NULL 
        AND h.longitude IS NOT NULL
        ${type ? `AND h.type LIKE '%${type}%'` : ""}
        ${insurance !== null ? `AND h.insurance = ${insurance === "true"}` : ""}
      HAVING distance <= ?
      ORDER BY distance ASC
      LIMIT ? OFFSET ?
    `,
      lat,
      lng,
      lat,
      radius,
      limit,
      skip
    );

    // 각 병원의 상세 정보 조회
    const hospitalIds = (hospitals as any[]).map((h: any) => h.id);

    const hospitalDetails = await prisma.hospital.findMany({
      where: {
        id: {
          in: hospitalIds,
        },
      },
      include: {
        locationDetails: true,
        operatingHours: true,
      },
    });

    // 거리 정보와 상세 정보 결합
    const result = (hospitals as any[]).map((h: any) => {
      const detail = hospitalDetails.find((d) => d.id === h.id);
      return {
        ...detail,
        distance: parseFloat(h.distance.toFixed(2)),
      };
    });

    // 총 개수 조회
    const totalResult = await prisma.$queryRawUnsafe(
      `
      SELECT COUNT(*) as count
      FROM hospitals h
      WHERE h.latitude IS NOT NULL 
        AND h.longitude IS NOT NULL
        ${type ? `AND h.type LIKE '%${type}%'` : ""}
        ${insurance !== null ? `AND h.insurance = ${insurance === "true"}` : ""}
        AND (6371 * acos(cos(radians(?)) * cos(radians(h.latitude)) * 
             cos(radians(h.longitude) - radians(?)) + 
             sin(radians(?)) * sin(radians(h.latitude)))) <= ?
    `,
      lat,
      lng,
      lat,
      radius
    );

    const total = (totalResult as any[])[0].count;

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
      },
      location: {
        lat,
        lng,
        radius,
      },
    });
  } catch (error) {
    console.error("Nearby Hospitals API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
