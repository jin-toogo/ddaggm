import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { 
        id,
        isVerified: true 
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            province: true,
            district: true,
            phone: true,
            website: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        categories: post.categories.split(',').filter(Boolean),
        tags: post.tags.split(',').filter(Boolean),
      }
    });

  } catch (error) {
    console.error('Get blog post error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}