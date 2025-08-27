import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const clinicId = parseInt(id);
//     const body = await request.json();
//     const { categoryIds, notes, assignedBy = 1 } = body;

//     if (!categoryIds || !Array.isArray(categoryIds)) {
//       return NextResponse.json(
//         { error: 'categoryIds array is required' },
//         { status: 400 }
//       );
//     }

//     const clinic = await prisma.hospital.findUnique({
//       where: { id: clinicId }
//     });

//     if (!clinic) {
//       return NextResponse.json(
//         { error: 'Clinic not found' },
//         { status: 404 }
//       );
//     }

//     const categories = await prisma.category.findMany({
//       where: {
//         id: {
//           in: categoryIds
//         }
//       }
//     });

//     if (categories.length !== categoryIds.length) {
//       return NextResponse.json(
//         { error: 'Some categories not found' },
//         { status: 400 }
//       );
//     }

//     const createdRelations = await Promise.all(
//       categoryIds.map(async (categoryId) => {
//         const existing = await prisma.clinicCategory.findUnique({
//           where: {
//             unique_clinic_category: {
//               clinicId,
//               categoryId
//             }
//           }
//         });

//         if (existing) {
//           if (!existing.isActive) {
//             return await prisma.clinicCategory.update({
//               where: {
//                 unique_clinic_category: {
//                   clinicId,
//                   categoryId
//                 }
//               },
//               data: {
//                 isActive: true,
//                 assignedBy,
//                 assignedAt: new Date(),
//                 notes
//               }
//             });
//           }
//           return existing;
//         }

//         return await prisma.clinicCategory.create({
//           data: {
//             clinicId,
//             categoryId,
//             assignedBy,
//             notes
//           }
//         });
//       })
//     );

//     const activeCount = await prisma.clinicCategory.count({
//       where: {
//         clinicId,
//         isActive: true
//       }
//     });

//     const activeCategories = await prisma.clinicCategory.findMany({
//       where: {
//         clinicId,
//         isActive: true
//       },
//       include: {
//         category: {
//           select: {
//             id: true,
//             name: true,
//             slug: true
//           }
//         }
//       }
//     });

//     await prisma.hospital.update({
//       where: { id: clinicId },
//       data: {
//         categoryCount: activeCount,
//         mainCategories: activeCategories.map(cc => ({
//           id: cc.category.id,
//           name: cc.category.name,
//           slug: cc.category.slug
//         }))
//       }
//     });

//     return NextResponse.json({
//       message: 'Categories assigned successfully',
//       assignedCategories: createdRelations.length,
//       totalActiveCategories: activeCount
//     });
//   } catch (error) {
//     console.error('Error assigning categories:', error);
//     return NextResponse.json(
//       { error: 'Failed to assign categories' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const clinicId = parseInt(id);
//     const searchParams = request.nextUrl.searchParams;
//     const categoryId = searchParams.get("categoryId");

//     if (!categoryId) {
//       return NextResponse.json(
//         { error: "categoryId is required" },
//         { status: 400 }
//       );
//     }

//     const relation = await prisma.clinicCategory.findUnique({
//       where: {
//         unique_clinic_category: {
//           clinicId,
//           categoryId: parseInt(categoryId),
//         },
//       },
//     });

//     if (!relation) {
//       return NextResponse.json(
//         { error: "Category not assigned to this clinic" },
//         { status: 404 }
//       );
//     }

//     await prisma.clinicCategory.update({
//       where: {
//         unique_clinic_category: {
//           clinicId,
//           categoryId: parseInt(categoryId),
//         },
//       },
//       data: {
//         isActive: false,
//       },
//     });

//     const activeCount = await prisma.clinicCategory.count({
//       where: {
//         clinicId,
//         isActive: true,
//       },
//     });

//     const activeCategories = await prisma.clinicCategory.findMany({
//       where: {
//         clinicId,
//         isActive: true,
//       },
//       include: {
//         category: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//           },
//         },
//       },
//     });

//     await prisma.hospital.update({
//       where: { id: clinicId },
//       data: {
//         categoryCount: activeCount,
//         mainCategories:
//           activeCategories.length > 0
//             ? activeCategories.map((cc) => ({
//                 id: cc.category.id,
//                 name: cc.category.name,
//                 slug: cc.category.slug,
//               }))
//             : null,
//       },
//     });

//     return NextResponse.json({
//       message: "Category removed successfully",
//       remainingCategories: activeCount,
//     });
//   } catch (error) {
//     console.error("Error removing category:", error);
//     return NextResponse.json(
//       { error: "Failed to remove category" },
//       { status: 500 }
//     );
//   }
// }
