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

    // 해당 병원의 진료과목 목록 조회
    const departments = await prisma.medicalDepartment.findMany({
      where: {
        hospitalId: hospitalId
      },
      orderBy: [
        { departmentCode: 'asc' }
      ],
      select: {
        id: true,
        departmentCode: true,
        departmentName: true,
        specialistCount: true,
        selectiveDoctorCount: true
      }
    });

    // 진료과목별 통계 정보 (선택사항)
    const departmentStats = await prisma.medicalDepartment.groupBy({
      by: ['departmentCode', 'departmentName'],
      where: {
        departmentCode: {
          in: departments.map(d => d.departmentCode)
        }
      },
      _count: {
        hospitalId: true
      },
      _sum: {
        specialistCount: true
      }
    });

    // 진료과목 정보에 통계 추가
    const departmentsWithStats = departments.map(dept => {
      const stats = departmentStats.find(s => s.departmentCode === dept.departmentCode);
      return {
        ...dept,
        totalHospitalsWithSameDepartment: stats?._count.hospitalId || 0,
        totalSpecialistsInDepartment: stats?._sum.specialistCount || 0
      };
    });

    return NextResponse.json({
      hospitalId: hospitalId,
      departments: departmentsWithStats,
      totalDepartments: departments.length,
      totalSpecialists: departments.reduce((sum, dept) => sum + (dept.specialistCount || 0), 0)
    });

  } catch (error) {
    console.error("Hospital Departments API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}