import { Clinic } from "@/types/clinics";

export const searchExamples = [
  "연남한의원",
  "강남 정통한의원",
  "홍대 한방클리닉",
];

// 한의원 데이터를 로드하는 함수
export async function loadClinics(): Promise<Clinic[]> {
  try {
    // 실제 프로덕션에서는 API 호출을 사용
    // 여기서는 정적 JSON 파일을 사용
    const response = await fetch("/api/clinics");
    if (!response.ok) {
      throw new Error("Failed to fetch clinics");
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading clinics:", error);
    return [];
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
  console.log(clinics);
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

export const cities = [
  { value: "서울특별시", label: "서울특별시" },
  { value: "부산광역시", label: "부산광역시" },
  { value: "인천광역시", label: "인천광역시" },
  { value: "대구광역시", label: "대구광역시" },
  { value: "광주광역시", label: "광주광역시" },
  { value: "대전광역시", label: "대전광역시" },
  { value: "울산광역시", label: "울산광역시" },
  { value: "경기도", label: "경기도" },
];

export const districts: Record<string, { value: string; label: string }[]> = {
  서울특별시: [
    { value: "강남구", label: "강남구" },
    { value: "강동구", label: "강동구" },
    { value: "강북구", label: "강북구" },
    { value: "강서구", label: "강서구" },
    { value: "관악구", label: "관악구" },
    { value: "광진구", label: "광진구" },
    { value: "구로구", label: "구로구" },
    { value: "금천구", label: "금천구" },
    { value: "노원구", label: "노원구" },
    { value: "도봉구", label: "도봉구" },
    { value: "동대문구", label: "동대문구" },
    { value: "동작구", label: "동작구" },
    { value: "마포구", label: "마포구" },
    { value: "서대문구", label: "서대문구" },
    { value: "서초구", label: "서초구" },
    { value: "성동구", label: "성동구" },
    { value: "성북구", label: "성북구" },
    { value: "송파구", label: "송파구" },
    { value: "양천구", label: "양천구" },
    { value: "영등포구", label: "영등포구" },
    { value: "용산구", label: "용산구" },
    { value: "은평구", label: "은평구" },
    { value: "종로구", label: "종로구" },
    { value: "중구", label: "중구" },
    { value: "중랑구", label: "중랑구" },
  ],
  부산광역시: [
    { value: "해운대구", label: "해운대구" },
    { value: "부산진구", label: "부산진구" },
    { value: "동구", label: "동구" },
    { value: "남구", label: "남구" },
    { value: "북구", label: "북구" },
  ],
  경기도: [
    { value: "수원시", label: "수원시" },
    { value: "성남시", label: "성남시" },
    { value: "고양시", label: "고양시" },
    { value: "용인시", label: "용인시" },
    { value: "안산시", label: "안산시" },
  ],
};
