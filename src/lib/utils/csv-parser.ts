export interface BlogCsvRow {
  blog_url: string;
  clinic_name?: string;
  clinic_address?: string;
  category?: string;
  notes?: string;
}

export interface BlogPostData {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  originalUrl: string;
  publishedAt: Date;
  author: string;
  clinicName?: string;
  clinicAddress?: string;
  hospitalId?: number;
  notes?: string;
  categories: string[];
  tags: string[];
}

/**
 * CSV 파일 내용을 파싱하여 BlogCsvRow 배열로 변환
 */
export function parseCSV(csvContent: string): BlogCsvRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV 파일이 비어있습니다.');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // 헤더 검증 (기본 필수 헤더만 검사, 카테고리는 선택적)
  const requiredKoreanHeaders = ['네이버 블로그 링크', '한의원명(있으면)', '한의원 주소', '비고'];
  const requiredEnglishHeaders = ['blog_url', 'clinic_name', 'clinic_address', 'notes'];
  
  const isKoreanHeaders = requiredKoreanHeaders.every(header => headers.includes(header));
  const isEnglishHeaders = requiredEnglishHeaders.every(header => headers.includes(header));
  
  if (!isKoreanHeaders && !isEnglishHeaders) {
    throw new Error(`CSV 헤더가 올바르지 않습니다. 필요한 헤더: ${requiredKoreanHeaders.join(', ')}`);
  }

  const data: BlogCsvRow[] = [];
  
  // 헤더 매핑 결정
  const headerMap = isKoreanHeaders ? {
    blog_url: '네이버 블로그 링크',
    clinic_name: '한의원명(있으면)',
    clinic_address: '한의원 주소',
    notes: '비고',
    category: '카테고리'
  } : {
    blog_url: 'blog_url',
    clinic_name: 'clinic_name',
    clinic_address: 'clinic_address',
    notes: 'notes',
    category: 'category'
  };
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const categoryIndex = headers.indexOf(headerMap.category);
    const row: BlogCsvRow = {
      blog_url: values[headers.indexOf(headerMap.blog_url)] || '',
      clinic_name: values[headers.indexOf(headerMap.clinic_name)] || undefined,
      clinic_address: values[headers.indexOf(headerMap.clinic_address)] || undefined,
      category: categoryIndex !== -1 ? values[categoryIndex] || undefined : undefined,
      notes: values[headers.indexOf(headerMap.notes)] || undefined,
    };

    if (row.blog_url) {
      data.push(row);
    }
  }

  return data;
}

/**
 * CSV 라인을 파싱하는 함수 (따옴표 처리 포함)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * 블로그 포스트 데이터에서 카테고리 추출
 */
export function extractCategories(content: string, title: string): string[] {
  const categories: string[] = [];
  const text = (title + ' ' + content).toLowerCase();

  // 카테고리 키워드 매핑
  const categoryKeywords = {
    '침구': ['침', '뜸', '침술', '침치료', '부항', '침구', '침놓', '침맞'],
    '한약': ['한약', '탕약', '처방', '약재', '한방약', '첩약'],
    '추나': ['추나', '교정', '척추', '추나요법', '정골', '도수치료'],
    '다이어트': ['다이어트', '비만', '살빼기', '체중감량', '다이어트한약'],
    '미용': ['미용', '성형', '피부', '미용침', '보톡스', '시술'],
    '임신': ['난임', '임신', '불임', '임신준비', '산후조리', '태교']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['일반'];
}

/**
 * 블로그 포스트 내용에서 태그 추출
 */
export function extractTags(content: string): string[] {
  const tags: string[] = [];
  
  // 해시태그 추출
  const hashtagMatches = content.match(/#[가-힣a-zA-Z0-9_]+/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(tag => tag.substring(1)));
  }

  return tags.filter((tag, index) => tags.indexOf(tag) === index); // 중복 제거
}