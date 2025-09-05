import { NextRequest, NextResponse } from 'next/server';
import { BlogReviewService } from '@/lib/services/blog-review-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const clinicName = searchParams.get('clinic') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await BlogReviewService.getBlogPosts(page, limit, {
      clinicName,
      category,
      search
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get blog reviews error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}