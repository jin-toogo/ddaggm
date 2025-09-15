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

    // URL에서 limit 파라미터 가져오기 (기본값: 10)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // 현재 병원의 좌표와 진료과목 조회
    const currentHospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        province: true,
        district: true,
        medicalDepartments: {
          select: {
            departmentCode: true,
            departmentName: true,
            specialistCount: true
          }
        }
      }
    });

    if (!currentHospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    // 현재 병원의 진료과목 코드들 추출
    const departmentCodes = currentHospital.medicalDepartments.map(dept => dept.departmentCode);
    
    if (departmentCodes.length === 0) {
      return NextResponse.json({
        currentHospital: {
          id: currentHospital.id,
          name: currentHospital.name,
          departments: []
        },
        similarHospitalsByDepartment: []
      });
    }

    // 같은 진료과목을 가진 다른 병원들 검색 (Prisma ORM 방식 사용)
    const similarHospitalsData = await prisma.medicalDepartment.findMany({
      where: {
        departmentCode: {
          in: departmentCodes
        },
        hospitalId: {
          not: hospitalId
        },
        hospital: {
          latitude: {
            not: null
          },
          longitude: {
            not: null
          }
        }
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            province: true,
            district: true,
            address: true,
            latitude: true,
            longitude: true,
            insurance: true
          }
        }
      },
      orderBy: [
        {
          specialistCount: 'desc'
        }
      ],
      take: limit * departmentCodes.length
    });

    // 거리 계산하여 결과 변환
    const similarHospitals = similarHospitalsData.map(dept => {
      const hospital = dept.hospital;
      let distanceKm: number | null = null;
      
      // 현재 병원과 대상 병원 모두 좌표가 있는 경우 거리 계산
      if (currentHospital.latitude && currentHospital.longitude && 
          hospital.latitude && hospital.longitude) {
        const lat1 = Number(currentHospital.latitude);
        const lon1 = Number(currentHospital.longitude);
        const lat2 = Number(hospital.latitude);
        const lon2 = Number(hospital.longitude);
        
        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = Number((R * c).toFixed(1));
      }
      
      return {
        id: hospital.id,
        name: hospital.name,
        province: hospital.province,
        district: hospital.district,
        address: hospital.address,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        insurance: hospital.insurance,
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        specialistCount: dept.specialistCount,
        distance_km: distanceKm
      };
    });

    // 거리순으로 정렬
    if (currentHospital.latitude && currentHospital.longitude) {
      similarHospitals.sort((a, b) => {
        if (a.distance_km === null && b.distance_km === null) return 0;
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    // 진료과목별로 그룹핑
    const departmentGroups = departmentCodes.map(deptCode => {
      const currentDept = currentHospital.medicalDepartments.find(d => d.departmentCode === deptCode);
      const hospitalsForDept = similarHospitals
        .filter(h => h.departmentCode === deptCode)
        .slice(0, limit)
        .map(h => ({
          id: Number(h.id),
          name: h.name,
          province: h.province,
          district: h.district,
          address: h.address,
          insurance: Boolean(h.insurance),
          specialistCount: Number(h.specialistCount) || 0,
          distanceKm: h.distance_km
        }));

      return {
        departmentCode: deptCode,
        departmentName: currentDept?.departmentName || '',
        currentHospitalSpecialists: currentDept?.specialistCount || 0,
        similarHospitals: hospitalsForDept
      };
    }).filter(group => group.similarHospitals.length > 0); // 유사 병원이 있는 진료과목만 포함

    return NextResponse.json({
      currentHospital: {
        id: currentHospital.id,
        name: currentHospital.name,
        province: currentHospital.province,
        district: currentHospital.district,
        departments: currentHospital.medicalDepartments.map(dept => ({
          departmentCode: dept.departmentCode,
          departmentName: dept.departmentName,
          specialistCount: dept.specialistCount
        }))
      },
      similarHospitalsByDepartment: departmentGroups
    });

  } catch (error) {
    console.error("Similar Departments API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}