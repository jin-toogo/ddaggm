import { Clinic } from "@/types/clinics";

export const searchExamples = [
  "연남한의원",
  "강남 정통한의원",
  "홍대 한방클리닉",
];

// API 응답 타입 정의
interface ClinicsResponse {
  data: Clinic[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
  };
}

// 한의원 데이터를 로드하는 함수
export async function loadClinics(
  searchQuery?: string,
  selectedCity?: string,
  selectedDistrict?: string,
  page?: number,
  limit?: number
): Promise<ClinicsResponse> {
  try {
    const params = new URLSearchParams();

    if (searchQuery) params.append("search", searchQuery);
    if (selectedCity && selectedCity !== "all")
      params.append("province", selectedCity);
    if (selectedDistrict && selectedDistrict !== "all")
      params.append("district", selectedDistrict);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const url = `/api/clinics${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch clinics");
    }
    const result = await response.json();
    console.log(
      "loadClinics API result:",
      result,
      "type:",
      typeof result,
      "isArray:",
      Array.isArray(result)
    );

    // 전체 데이터 로드인 경우 (페이지네이션 없음)

    return result;
  } catch (error) {
    console.error("Error loading clinics:", error);
    return {
      data: [],
      pagination: {
        currentPage: 0,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        itemsPerPage: 0,
      },
    };
  }
}

// 검색어와 필터로 한의원을 필터링하는 함수
export function filterClinics(
  clinics: Clinic[],
  searchQuery: string,
  selectedCity: string,
  selectedDistrict: string
): Clinic[] {
  let filtered = clinics;

  // 검색어로 필터링
  if (searchQuery.trim()) {
    filtered = filtered.filter(
      (clinic) =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 도시로 필터링
  if (selectedCity && selectedCity !== "all") {
    filtered = filtered.filter((clinic) => clinic.city_kor === selectedCity);
  }

  // 구/군으로 필터링
  if (selectedDistrict && selectedDistrict !== "all") {
    filtered = filtered.filter(
      (clinic) => clinic.district_kor === selectedDistrict
    );
  }

  return filtered;
}

// 도시 목록을 가져오는 함수
export function getCities(clinics: Clinic[]): string[] {
  const cities = new Set(clinics.map((clinic) => clinic.city_kor));
  return Array.from(cities).sort();
}

// 구/군 목록을 가져오는 함수
export function getDistricts(
  clinics: Clinic[],
  selectedCity: string
): string[] {
  if (selectedCity === "all") return [];

  const districts = new Set(
    clinics
      .filter((clinic) => clinic.city_kor === selectedCity)
      .map((clinic) => clinic.district_kor)
  );
  return Array.from(districts).sort();
}

// 7가지 주요 치료법 카테고리 (기획서 기반)
export const treatmentCategories = [
  {
    id: "chuna",
    name: "추나요법",
    searchKeyword: "추나",
    description: "척추/관절 교정 치료",
    dataCount: 500,
    percentage: 3.3,
    keywords: [
      "추나",
      "척추교정",
      "관절교정",
      "자세교정",
      "단순추나",
      "복잡추나",
      "특수추나",
    ],
  },
  {
    id: "herbal-injection",
    name: "약침술",
    searchKeyword: "약침",
    description: "경혈 약침 치료",
    dataCount: 3046,
    percentage: 20.08,
    keywords: ["약침", "봉침"],
  },
  {
    id: "manual-therapy",
    name: "도수치료",
    searchKeyword: "도수",
    description: "근골격계 재활 치료",

    dataCount: 1409,
    percentage: 9.29,
    keywords: [
      "도수",
      "물리치료",
      "재활치료",
      "근육치료",
      "일반 도수치료",
      "전문 도수치료",
    ],
  },
  {
    id: "shockwave",
    name: "체외충격파치료",
    description: "충격파를 이용한 치료",
    searchKeyword: "충격파",
    dataCount: 819,
    percentage: 5.4,
    keywords: ["충격파", "체외충격파", "족저근막염치료", "체외충격파치료"],
  },
  {
    id: "ultrasound",
    name: "초음파검사",
    description: "근골격 초음파 진단",
    searchKeyword: "초음파",
    dataCount: 443,
    percentage: 2.92,
    keywords: [
      "관절초음파",
      "근골격초음파",
      "무릎초음파",
      "어깨초음파",
      "근골격 관절 초음파",
      "근골격 연부조직 초음파",
    ],
  },
  {
    id: "mri",
    name: "MRI검사",
    description: "자기공명영상 정밀진단",
    searchKeyword: "MRI",
    dataCount: 405,
    percentage: 2.67,
    keywords: ["MRI"],
  },
  {
    id: "vaccination",
    name: "예방접종",
    description: "각종 백신 접종",
    searchKeyword: "예방접종",
    dataCount: 787,
    percentage: 5.19,
    keywords: [
      "독감예방접종",
      "대상포진백신",
      "폐렴구균백신",
      "A형간염 예방접종",
      "예방접종",
    ],
  },
];

export const nonCoveredServices = [
  "추나요법",
  "약침술",
  "도수치료",
  "체외충격파치료",
  "초음파검사",
  "MRI검사",
  "예방접종",
];

export const cities = [
  "서울특별시",
  "부산광역시",
  "인천광역시",
  "대구광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주도",
];

export const districts: Record<string, string[]> = {
  서울특별시: [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ],
  인천광역시: [
    "계양구",
    "남구",
    "남동구",
    "동구",
    "부평구",
    "서구",
    "연수구",
    "중구",
    "강화군",
    "옹진군",
  ],
  대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
  광주광역시: ["광산구", "남구", "동구", "북구", "서구"],
  대구광역시: [
    "남구",
    "달서구",
    "동구",
    "북구",
    "서구",
    "수성구",
    "중구",
    "달성군",
  ],
  울산광역시: ["남구", "동구", "북구", "중구", "울주군"],
  부산광역시: [
    "강서구",
    "금정구",
    "남구",
    "동구",
    "동래구",
    "부산진구",
    "북구",
    "사상구",
    "사하구",
    "서구",
    "수영구",
    "연제구",
    "영도구",
    "중구",
    "해운대구",
    "기장군",
  ],
  경기도: [
    "고양시",
    "과천시",
    "광명시",
    "광주시",
    "구리시",
    "군포시",
    "김포시",
    "남양주시",
    "동두천시",
    "부천시",
    "성남시",
    "수원시",
    "시흥시",
    "안산시",
    "안성시",
    "안양시",
    "양주시",
    "오산시",
    "용인시",
    "의왕시",
    "의정부시",
    "이천시",
    "파주시",
    "평택시",
    "포천시",
    "하남시",
    "화성시",
    "가평군",
    "양평군",
    "여주군",
    "연천군",
  ],
  강원도: [
    "강릉시",
    "동해시",
    "삼척시",
    "속초시",
    "원주시",
    "춘천시",
    "태백시",
    "고성군",
    "양구군",
    "양양군",
    "영월군",
    "인제군",
    "정선군",
    "철원군",
    "평창군",
    "홍천군",
    "화천군",
    "횡성군",
  ],
  충청북도: [
    "제천시",
    "청주시",
    "충주시",
    "괴산군",
    "단양군",
    "보은군",
    "영동군",
    "옥천군",
    "음성군",
    "증평군",
    "진천군",
    "청원군",
  ],
  충청남도: [
    "계룡시",
    "공주시",
    "논산시",
    "보령시",
    "서산시",
    "아산시",
    "천안시",
    "금산군",
    "당진군",
    "부여군",
    "서천군",
    "연기군",
    "예산군",
    "청양군",
    "태안군",
    "홍성군",
  ],
  전라북도: [
    "군산시",
    "김제시",
    "남원시",
    "익산시",
    "전주시",
    "정읍시",
    "고창군",
    "무주군",
    "부안군",
    "순창군",
    "완주군",
    "임실군",
    "장수군",
    "진안군",
  ],
  전라남도: [
    "광양시",
    "나주시",
    "목포시",
    "순천시",
    "여수시",
    "강진군",
    "고흥군",
    "곡성군",
    "구례군",
    "담양군",
    "무안군",
    "보성군",
    "신안군",
    "영광군",
    "영암군",
    "완도군",
    "장성군",
    "장흥군",
    "진도군",
    "함평군",
    "해남군",
    "화순군",
  ],
  경상북도: [
    "경산시",
    "경주시",
    "구미시",
    "김천시",
    "문경시",
    "상주시",
    "안동시",
    "영주시",
    "영천시",
    "포항시",
    "고령군",
    "군위군",
    "봉화군",
    "성주군",
    "영덕군",
    "영양군",
    "예천군",
    "울릉군",
    "울진군",
    "의성군",
    "청도군",
    "청송군",
    "칠곡군",
  ],
  경상남도: [
    "거제시",
    "김해시",
    "마산시",
    "밀양시",
    "사천시",
    "양산시",
    "진주시",
    "진해시",
    "창원시",
    "통영시",
    "거창군",
    "고성군",
    "남해군",
    "산청군",
    "의령군",
    "창녕군",
    "하동군",
    "함안군",
    "함양군",
    "합천군",
  ],
  제주도: ["서귀포시", "제주시", "남제주군", "북제주군"],
};
