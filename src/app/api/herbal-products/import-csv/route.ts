import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface CSVRecord {
  가격: string;
  링크: string;
  이미지: string;
  이름: string;
  카테고리: string;
  판매처: string;
}

// 카테고리 매핑
const categoryMapping: { [key: string]: string } = {
  '여성질환': '여성건강',
  '수면': '수면개선',
  '면역력': '면역개선',
  '혈당조절': '혈당관리',
  '소화질환': '소화개선'
};

function formatPrice(priceStr: string): string {
  const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
  if (isNaN(price)) return priceStr;
  return `${price.toLocaleString()}원`;
}

function generateDescription(name: string, category: string): string {
  const descriptions: { [key: string]: string[] } = {
    '여성질환': ['갱년기 증상 완화에 도움을 주는 한방 건강기능식품', '여성 건강 관리를 위한 천연 성분', '호르몬 밸런스 개선에 도움'],
    '수면': ['깊은 잠을 위한 천연 성분으로 제조된 수면 개선 제품', '수면의 질 개선에 도움', '스트레스 완화로 편안한 수면'],
    '면역력': ['면역체계 강화에 도움을 주는 프리미엄 제품', '천연 면역력 증진 성분', '건강한 면역 기능 유지'],
    '혈당조절': ['혈당 수치 관리에 도움을 주는 천연 성분의 한방 제품', '당뇨 예방을 위한 천연 성분', '혈당 밸런스 유지'],
    '소화질환': ['소화 기능 개선에 도움을 주는 위장 건강 제품', '위장 건강을 위한 한방 제품', '소화불량 완화']
  };

  const categoryDescriptions = descriptions[category] || ['건강 관리를 위한 한방 건강기능식품'];
  return categoryDescriptions[0]; // 첫 번째 설명 사용
}

// 개선된 CSV 파싱 함수 (복잡한 데이터 형식 지원)
function parseCSV(csvText: string): CSVRecord[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV 파일에 헤더와 최소 1개 행이 필요합니다.');
  }

  // 헤더 파싱
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  console.log('헤더:', headers);

  const records: CSVRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line);
      
      if (values.length >= 6) {
        const record: CSVRecord = {
          가격: values[0] || '',
          링크: values[1] || '',
          이미지: values[2] || '',
          이름: values[3] || '',
          카테고리: values[4] || '',
          판매처: values[5] || ''
        };
        
        // 필수 필드 검증
        if (record.이름.trim() && record.링크.trim()) {
          records.push(record);
          console.log(`파싱 성공 ${i}번째 행:`, record.이름);
        } else {
          console.log(`스킵 ${i}번째 행 - 필수 필드 누락:`, { 이름: record.이름, 링크: record.링크 });
        }
      } else {
        console.log(`스킵 ${i}번째 행 - 컬럼 수 부족:`, values.length, 'values:', values);
      }
    } catch (error) {
      console.error(`${i}번째 행 파싱 에러:`, error, 'line:', line);
      continue;
    }
  }

  return records;
}

// CSV 라인을 파싱하는 헬퍼 함수 (따옴표와 쉼표 처리)
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (!inQuotes) {
      if (char === '"' || char === "'") {
        inQuotes = true;
        quoteChar = char;
      } else if (char === ',') {
        values.push(current.trim());
        current = '';
      } else if (char === '\t') {
        // 탭 문자를 쉼표로 처리 (일부 CSV에서 탭 구분자 사용)
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else {
      if (char === quoteChar) {
        // 다음 문자가 동일한 따옴표인지 확인 (escaped quote)
        if (i + 1 < line.length && line[i + 1] === quoteChar) {
          current += char;
          i++; // 다음 문자도 건너뛰기
        } else {
          inQuotes = false;
          quoteChar = '';
        }
      } else {
        current += char;
      }
    }
  }
  
  // 마지막 값 추가
  values.push(current.trim());
  
  return values;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'CSV 파일이 필요합니다' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    
    // CSV 파싱 (blog-posts와 동일한 방식)
    const records = parseCSV(csvContent);

    console.log(`CSV에서 ${records.length}개 레코드 파싱됨`);

    // 데이터베이스에 저장
    const createdProducts: any[] = [];
    let displayOrder = 1;

    for (const record of records) {
      try {
        if (!record.이름 || !record.링크) {
          console.log(`스킵: 제품명 또는 링크가 없음 - ${JSON.stringify(record)}`);
          continue;
        }

        const mappedCategory = categoryMapping[record.카테고리] || record.카테고리;
        
        // 동일한 URL이 이미 존재하는지 확인
        const existingProduct = await prisma.herbalProduct.findFirst({
          where: {
            url: record.링크
          }
        });

        if (existingProduct) {
          console.log(`스킵 - 이미 존재하는 URL: ${record.이름} (${record.링크})`);
          continue;
        }
        
        const product = await prisma.herbalProduct.create({
          data: {
            name: record.이름.trim(),
            category: mappedCategory,
            description: generateDescription(record.이름, record.카테고리),
            price: formatPrice(record.가격),
            brand: record.판매처,
            url: record.링크,
            imageUrl: record.이미지,
            displayOrder: displayOrder++,
            isActive: true
          }
        });
        
        createdProducts.push(product);
        console.log(`제품 생성됨: ${product.name}`);
      } catch (error) {
        console.error(`제품 생성 실패 (${record.이름}):`, error);
        // 개별 실패는 무시하고 계속 진행
      }
    }

    return NextResponse.json({
      message: `${createdProducts.length}개 제품이 성공적으로 가져와졌습니다`,
      imported: createdProducts.length,
      total: records.length
    });

  } catch (error) {
    console.error('CSV import 에러:', error);
    return NextResponse.json(
      { error: 'CSV 파일 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}