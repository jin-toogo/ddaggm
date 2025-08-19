import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const province = searchParams.get("province");
    const district = searchParams.get("district");
    const insurance = searchParams.get("insurance");

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

    if (insurance !== null && insurance !== undefined) {
      where.insurance = insurance === "true";
    }

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
      },
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
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
      }) => ({
        id: hospital.id.toString(),
        name: hospital.name,
        address: hospital.address,
        city: hospital.province,
        city_kor: hospital.province,
        district: hospital.district,
        district_kor: hospital.district,
        phone: hospital.phone,
        insurance: hospital.insurance,
        status: "active",
      })
    );

    return NextResponse.json(clinics);
  } catch (error) {
    console.error("Error reading clinics data:", error);
    return NextResponse.json(
      { error: "Failed to load clinics data" },
      { status: 500 }
    );
  }
}
