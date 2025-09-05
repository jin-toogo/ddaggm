import { NextRequest, NextResponse } from 'next/server';
import { BlogReviewService } from '@/lib/services/blog-review-service';
import { parseCSV } from '@/lib/utils/csv-parser';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'CSV 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'CSV 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // CSV 파일 읽기
    const csvContent = await file.text();
    
    // CSV 파싱
    const csvRows = parseCSV(csvContent);
    
    if (csvRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSV 파일에 유효한 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // 블로그 포스트 처리
    const result = await BlogReviewService.processCsvData(csvRows);

    return NextResponse.json({
      success: true,
      data: {
        totalRows: csvRows.length,
        processed: result.processed,
        matched: result.matched,
        unmatchedCount: result.processed - result.matched,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}