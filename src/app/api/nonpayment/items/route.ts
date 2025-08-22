import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const sortBy = searchParams.get("sortBy") || "price_asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    console.log("API Filter params:", {
      requestUrl: request.url,
      category,
      search,
      location,
      sortBy,
      page,
      limit,
    });

    // 필터 조건
    const where: any = {
      treatmentName: {
        not: null,
      },
      amount: {
        not: null,
      },
    };

    // category로 필터링 (선택사항)
    if (category && category !== "all") {
      where.OR = [
        {
          category: {
            contains: category,
          },
        },
        {
          treatmentName: {
            contains: category,
          },
        },
      ];
    }

    // 검색어로 필터링
    if (search) {
      const searchConditions = [
        {
          treatmentName: {
            contains: search,
          },
        },
        {
          category: {
            contains: search,
          },
        },
        {
          hospital: {
            name: {
              contains: search,
            },
          },
        },
      ];

      if (where.OR) {
        // 카테고리 필터가 이미 있는 경우 AND로 결합
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // 지역 필터링
    if (location && location !== "all") {
      const locationConditions = [
        {
          hospital: {
            province: {
              contains: location,
            },
          },
        },
      ];

      if (where.AND) {
        where.AND.push({ OR: locationConditions });
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: locationConditions }];
        delete where.OR;
      } else {
        where.OR = locationConditions;
      }
    }
    console.log("where!!! :>> ", where);
    // 정렬 옵션 설정
    let orderBy: any[] = [];
    switch (sortBy) {
      case "price_desc":
        orderBy = [{ amount: "desc" }, { treatmentName: "asc" }];
        break;
      case "price_asc":
      default:
        orderBy = [{ amount: "asc" }, { treatmentName: "asc" }];
        break;
    }

    // 비급여 항목과 병원 정보 조회
    const nonPaymentItems = await prisma.hospitalNonPaymentItem.findMany({
      select: {
        id: true,
        npayCode: true,
        category: true,
        treatmentName: true,
        amount: true,
        yadmNm: true,
        hospitalId: true,
        hospital: {
          select: {
            id: true,
            name: true,
            province: true,
            district: true,
          },
        },
      },
      where,
      orderBy,
      skip,
      take: limit,
    });

    // 총 개수 조회
    const totalCount = await prisma.hospitalNonPaymentItem.count({
      where,
    });

    // 디버깅: 실제 카테고리 목록 조회 (개발 시에만)
    if (category && category !== "all") {
      const distinctCategories = await prisma.hospitalNonPaymentItem.findMany({
        select: { category: true },
        distinct: ["category"],
        where: { category: { not: null } },
        take: 20,
      });
      console.log(
        "Available categories:",
        distinctCategories.map((c) => c.category)
      );
    }

    console.log("Where condition:", JSON.stringify(where, null, 2));
    console.log("Found items count:", nonPaymentItems.length);

    // 데이터 변환
    const items = nonPaymentItems.map((item) => ({
      id: item.id,
      treatmentName: item.treatmentName,
      category: item.category,
      amount: item.amount,
      clinicName: item.hospital?.name || item.yadmNm,
      province: item.hospital?.province,
      district: item.hospital?.district,
      npayCode: item.npayCode,
      yadmNm: item.yadmNm,
      hospitalId: item.hospitalId,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: items,
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
    console.error("Error fetching non-payment items:", error);
    return NextResponse.json(
      { error: "Failed to fetch non-payment items" },
      { status: 500 }
    );
  }
}
