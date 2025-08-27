import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "distance";
    const province = searchParams.get("province");
    const district = searchParams.get("district");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const { slug } = await params;
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    const whereCondition: any = {
      clinicCategories: {
        some: {
          categoryId: category.id,
          isActive: true,
        },
      },
      type: {
        contains: "한의",
      },
    };

    if (province) {
      whereCondition.province = province;
    }
    if (district) {
      whereCondition.district = district;
    }

    const orderBy: any = {};
    switch (sort) {
      case "name":
        orderBy.name = "asc";
        break;
      case "created":
        orderBy.createdAt = "desc";
        break;
      default:
        orderBy.name = "asc";
    }

    const [clinics, total] = await Promise.all([
      prisma.hospital.findMany({
        where: whereCondition,
        orderBy,
        skip,
        take: limit,
        include: {
          clinicCategories: {
            where: {
              isActive: true,
            },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          operatingHours: true,
        },
      }),
      prisma.hospital.count({
        where: whereCondition,
      }),
    ]);

    const formattedClinics = clinics.map((clinic) => {
      // let distance = null;
      // if (lat && lng && clinic.latitude && clinic.longitude) {
      //   const R = 6371;
      //   const dLat = (parseFloat(clinic.latitude.toString()) - parseFloat(lat)) * Math.PI / 180;
      //   const dLon = (parseFloat(clinic.longitude.toString()) - parseFloat(lng)) * Math.PI / 180;
      //   const a =
      //     Math.sin(dLat/2) * Math.sin(dLat/2) +
      //     Math.cos(parseFloat(lat) * Math.PI / 180) *
      //     Math.cos(parseFloat(clinic.latitude.toString()) * Math.PI / 180) *
      //     Math.sin(dLon/2) * Math.sin(dLon/2);
      //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      //   distance = Math.round(R * c * 10) / 10;
      // }

      return {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        province: clinic.province,
        district: clinic.district,
        dong: clinic.dong,
        phone: clinic.phone,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        // distance,
        categories: clinic.clinicCategories.map((cc) => cc.category),
        operatingHours: clinic.operatingHours,
      };
    });

    // if (sort === 'distance' && lat && lng) {
    //   formattedClinics.sort((a, b) => {
    //     if (a.distance === null) return 1;
    //     if (b.distance === null) return -1;
    //     return a.distance - b.distance;
    //   });
    // }

    return NextResponse.json({
      clinics: formattedClinics,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching clinics by category:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinics" },
      { status: 500 }
    );
  }
}
