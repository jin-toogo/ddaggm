import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = parseInt(id);

    if (isNaN(hospitalId)) {
      return NextResponse.json(
        { error: "Invalid hospital ID" },
        { status: 400 }
      );
    }

    // 특정 병원 상세 정보 조회
    const hospital = await prisma.hospital.findUnique({
      where: {
        id: hospitalId,
      },
      include: {
        locationDetails: true,
        operatingHours: true,
        nonPaymentItems: {
          orderBy: {
            amount: "asc",
          },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: hospital,
    });
  } catch (error) {
    console.error("Hospital Detail API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
