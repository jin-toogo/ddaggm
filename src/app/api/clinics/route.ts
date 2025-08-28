import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const province = searchParams.get("province");
    const district = searchParams.get("district");
    const insurance = searchParams.get("insurance");
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (province) {
      where.province = province;
    }

    if (district) {
      where.district = district;
    }

    if (category) {
      where.clinicCategories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }
    const orderBy: any = {
      updatedAt: "desc",
    };

    // 총 개수 조회
    const totalCount = await prisma.hospital.count({ where });

    // 병원 목록 조회 (Clinic 인터페이스에 맞게 변환)
    const hospitals = await prisma.hospital.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        province: true,
        district: true,
        phone: true,
        insurance: true,
        type: true,
        website: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    // Clinic 인터페이스에 맞게 데이터 변환
    const clinics = hospitals.map(
      (hospital: {
        id: number;
        name: string;
        address: string;
        province: string;
        district: string;
        phone: string | null;
        insurance: boolean;
        type: string;
        website: string | null;
      }) => ({
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        province: hospital.province,
        district: hospital.district,
        phone: hospital.phone,
        insurance: hospital.insurance,
        type: hospital.type,
        website: hospital.website,
      })
    );

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      clinics: clinics,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error reading clinics data:", error);
    return NextResponse.json(
      { error: "Failed to load clinics data" },
      { status: 500 }
    );
  }
}
