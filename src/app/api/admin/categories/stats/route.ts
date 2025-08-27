import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc'
      },
      include: {
        _count: {
          select: {
            clinicCategories: true
          }
        }
      }
    });

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const activeCount = await prisma.clinicCategory.count({
          where: {
            categoryId: category.id,
            isActive: true
          }
        });

        const clinicsWithCategory = await prisma.hospital.findMany({
          where: {
            clinicCategories: {
              some: {
                categoryId: category.id,
                isActive: true
              }
            }
          },
          select: {
            province: true
          }
        });

        const provinceDistribution = clinicsWithCategory.reduce((acc, clinic) => {
          acc[clinic.province] = (acc[clinic.province] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          categoryId: category.id,
          categoryName: category.name,
          categorySlug: category.slug,
          isActive: category.isActive,
          totalAssigned: category._count.clinicCategories,
          activeCount,
          inactiveCount: category._count.clinicCategories - activeCount,
          provinceDistribution
        };
      })
    );

    const totalStats = {
      totalCategories: categories.length,
      activeCategories: categories.filter(c => c.isActive).length,
      totalAssignments: categoryStats.reduce((sum, stat) => sum + stat.totalAssigned, 0),
      activeAssignments: categoryStats.reduce((sum, stat) => sum + stat.activeCount, 0)
    };

    return NextResponse.json({
      categoryStats,
      summary: totalStats
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category statistics' },
      { status: 500 }
    );
  }
}