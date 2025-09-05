import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!name && !address) {
      return NextResponse.json(
        { success: false, error: 'Name or address parameter is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    const orConditions: any[] = [];

    if (name) {
      orConditions.push(
        { name: { contains: name } },
        { name: { contains: name.replace(/한의원$/, '') } },
        { name: { contains: name + '한의원' } }
      );
    }

    if (address) {
      orConditions.push(
        { address: { contains: address } },
        { province: { contains: address } },
        { district: { contains: address } }
      );
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    const hospitals = await prisma.hospital.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        province: true,
        district: true,
        phone: true,
      },
      take: limit,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: hospitals
    });

  } catch (error) {
    console.error('Hospital search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}