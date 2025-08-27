import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clinicId = parseInt(id);
    
    const clinic = await prisma.hospital.findUnique({
      where: { id: clinicId },
      include: {
        clinicCategories: {
          where: {
            isActive: true
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                displayOrder: true
              }
            }
          },
          orderBy: {
            category: {
              displayOrder: 'asc'
            }
          }
        }
      }
    });

    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const categories = clinic.clinicCategories.map(cc => cc.category);

    return NextResponse.json({
      clinicId: clinic.id,
      clinicName: clinic.name,
      categories
    });
  } catch (error) {
    console.error('Error fetching clinic categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic categories' },
      { status: 500 }
    );
  }
}