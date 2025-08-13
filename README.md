# 한의원 보험 적용 확인 시스템

Next.js, Tailwind CSS, shadcn/ui를 사용하여 구축된 한의원 보험 적용 여부 확인 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks

## ✨ 주요 기능

- 🔍 **한의원명 검색**: 한의원명으로 보험 적용 여부 확인
- 🏙️ **지역별 필터링**: 도시 및 구/군별 필터링
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원
- 🎨 **현대적인 UI**: shadcn/ui 컴포넌트로 구성된 아름다운 인터페이스
- ⚡ **빠른 검색**: 실시간 필터링 및 검색 결과

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 브라우저에서 확인

```
http://localhost:3000
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── clinics/       # 한의원 데이터 API
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── Header.tsx        # 헤더 컴포넌트
│   ├── SearchBar.tsx     # 검색바 컴포넌트
│   ├── FilterDropdowns.tsx # 필터 드롭다운
│   ├── ClinicList.tsx    # 한의원 목록
│   ├── ClinicListItem.tsx # 한의원 아이템
│   └── Footer.tsx        # 푸터 컴포넌트
├── lib/                  # 유틸리티 함수
│   └── clinics.ts        # 한의원 데이터 처리
└── types/                # TypeScript 타입 정의
    └── clinics.ts        # 한의원 관련 타입
```

## 🔧 주요 컴포넌트

### Header

- 네비게이션 메뉴
- 프로젝트 제목

### SearchBar

- 한의원명 검색 입력
- 검색 버튼

### FilterDropdowns

- 도시 선택 드롭다운
- 구/군 선택 드롭다운
- 검색 결과 수 표시

### ClinicList

- 검색 결과 목록
- 페이지네이션 (더 보기)
- 로딩 상태 표시

### ClinicListItem

- 한의원 정보 표시
- 네이버 검색 링크
- Google 지도 링크

## 📊 데이터 구조

한의원 데이터는 다음과 같은 구조를 가집니다:

```typescript
interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  phone?: string;
  insurance?: boolean;
  status?: string;
}
```

## 🌐 API 엔드포인트

- `GET /api/clinics`: 한의원 데이터 조회

## 🎨 스타일링

- Tailwind CSS를 사용한 유틸리티 클래스 기반 스타일링
- shadcn/ui 컴포넌트 시스템
- 다크 모드 지원
- 반응형 디자인

## 📱 반응형 지원

- 모바일: 320px+
- 태블릿: 768px+
- 데스크톱: 1024px+

## 🚀 배포

### Vercel 배포

```bash
npm run build
```

### 정적 내보내기

```bash
npm run export
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**한의원 보험 적용 확인 시스템** - Next.js + Tailwind CSS + shadcn/ui로 구축
