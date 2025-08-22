# Claude Code 프로젝트 설정

## 프로젝트 개요
한의원 보험 적용 확인 시스템 - Next.js + TypeScript + Prisma + MySQL을 사용한 의료 정보 플랫폼

## 기술 스택
- **Framework**: Next.js 15.0.0 (App Router)
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Styling**: Tailwind CSS 4.0.0
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Container**: Docker & Docker Compose

## 주요 명령어

### 개발 환경
```bash
npm run dev              # 개발 서버 시작 (localhost:3000)
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 시작
npm run lint             # ESLint 검사
```

### 데이터베이스 관리
```bash
npm run db:push          # Prisma 스키마를 데이터베이스에 푸시
npm run db:seed          # 데이터베이스 시드 데이터 삽입
npm run db:studio        # Prisma Studio 실행 (데이터베이스 GUI)
```

### 데이터 관리 스크립트
```bash
npm run update-hospital-codes    # 병원 코드 업데이트
npm run crawl-nonpayment        # 비급여 데이터 크롤링
npm run sitemap:generate        # 사이트맵 생성
npm run robots:generate         # robots.txt 생성
```

### Docker 환경
```bash
npm run docker:up        # Docker 컨테이너 시작
npm run docker:down      # Docker 컨테이너 종료
npm run docker:logs      # Docker 로그 확인
```

## 프로젝트 구조
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 라우트
│   │   ├── clinics/    # 한의원 API
│   │   ├── hospitals/  # 병원 API
│   │   └── nonpayment/ # 비급여 API
│   ├── hospital/[id]/  # 병원 상세 페이지
│   ├── non-covered/    # 비급여 페이지
│   └── page.tsx        # 메인 페이지
├── components/         # React 컴포넌트
│   ├── ui/            # shadcn/ui 기본 컴포넌트
│   ├── ClinicList.tsx # 한의원 목록
│   ├── SearchBar.tsx  # 검색바
│   └── ...
├── lib/               # 유틸리티 라이브러리
├── types/             # TypeScript 타입 정의
└── constants/         # 상수 정의
```

## 데이터베이스 모델
- **Hospital**: 병원/한의원 기본 정보
- **HospitalLocationDetail**: 위치 상세 정보
- **HospitalOperatingHour**: 운영시간 정보
- **HospitalNonPaymentItem**: 비급여 항목 정보

## 환경 변수
```bash
DATABASE_URL=mysql://username:password@localhost:3306/database_name
```

## API 엔드포인트
- `GET /api/hospitals` - 병원 목록 조회
- `GET /api/hospitals/[id]` - 병원 상세 정보
- `GET /api/hospitals/search` - 병원 검색
- `GET /api/nonpayment/items` - 비급여 항목 조회
- `GET /api/nonpayment/categories` - 카테고리별 비급여 조회

## 테스트 및 품질 관리
- **린트**: `npm run lint` (Next.js ESLint 설정)
- **타입 체크**: TypeScript 컴파일러가 자동으로 수행
- **빌드 검증**: `npm run build`로 프로덕션 빌드 확인

## 배포 설정
- **Output**: Standalone 모드로 설정 (Docker 배포 최적화)
- **Sitemap**: 정적 사이트맵 및 동적 생성 지원
- **Robots.txt**: SEO 최적화

## 주의사항
- 데이터베이스 스키마 변경 시 `npm run db:push` 실행 필요
- 비급여 데이터는 크롤링을 통해 주기적 업데이트
- Docker 환경에서 데이터베이스 연결 설정 확인 필요
- Prisma Studio로 데이터 확인 및 관리 가능

## 개발 워크플로우
1. 새 기능 개발 시 브랜치 생성
2. `npm run dev`로 개발 서버 시작
3. 코드 변경 후 `npm run lint` 실행
4. 데이터베이스 변경 시 `npm run db:push`
5. `npm run build`로 빌드 확인
6. 변경사항 커밋 및 푸시