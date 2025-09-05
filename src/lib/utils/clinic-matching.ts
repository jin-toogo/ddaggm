/**
 * 한의원명을 정규화하는 함수 (지점명 제거 포함)
 */
export function normalizeName(name: string): string {
  if (!name) return "";
  return (
    name
      .replace(/\s+/g, "") // 공백 제거
      // 지점명 제거 (점, 본점, 분원 등)
      .replace(/\s*청라점$/, "")
      .replace(/\s*강남점$/, "")
      .replace(/\s*부산본점$/, "")
      .replace(/\s*서울점$/, "")
      .replace(/\s*인천점$/, "")
      .replace(/\s*대구점$/, "")
      .replace(/\s*광주점$/, "")
      .replace(/\s*울산점$/, "")
      .replace(/\s*창원점$/, "")
      .replace(/\s*전주점$/, "")
      .replace(/\s*천안점$/, "")
      .replace(/\s*안양점$/, "")
      .replace(/\s*수원점$/, "")
      .replace(/\s*분당점$/, "")
      .replace(/\s*일산점$/, "")
      .replace(/\s*본점$/, "")
      .replace(/\s*분원$/, "")
      .replace(/\s*제\d+지점$/, "")
      .replace(/\s*지점$/, "")
      .replace(/\s*점$/, "")
      // 한의원 접미사 제거 (비교를 위해)
      .replace(/한의원$/, "")
      .toLowerCase()
  );
}

/**
 * 주소를 도로명+건물번호까지만 추출하여 정규화하는 함수
 */
export function normalizeAddress(address: string): string {
  if (!address) return "";

  // 도로명+건물번호까지만 추출 (건물명, 층수 등 제거)
  let cleanAddress = address
    .replace(/\s*\d+층.*$/g, "") // N층 이후 모든 내용 제거
    .replace(/\s*[가-힣]+빌딩.*$/g, "") // XX빌딩 이후 모든 내용 제거
    .replace(/\s*[가-힣]+타워.*$/g, "") // XX타워 이후 모든 내용 제거
    .replace(/\s*[가-힣]+프라자.*$/g, "") // XX프라자 이후 모든 내용 제거
    .replace(/\s*[가-힣]+센터.*$/g, "") // XX센터 이후 모든 내용 제거
    .replace(/\s*[가-힣]+상가.*$/g, "") // XX상가 이후 모든 내용 제거
    .replace(/\s*\d+호.*$/g, "") // NNN호 이후 모든 내용 제거
    .replace(/\s*,.*$/g, "") // 쉼표 이후 모든 내용 제거
    .replace(/\s*\(.*?\)/g, "") // 괄호 안의 모든 내용 제거
    .replace(/\s+/g, " ")
    .trim();

  // 정규화: 공백 제거, 소문자 변환, 지역명 통일
  return cleanAddress
    .replace(/\s+/g, "")
    .replace(/서울특별시/g, "서울")
    .replace(/부산광역시/g, "부산")
    .replace(/대구광역시/g, "대구")
    .replace(/인천광역시/g, "인천")
    .replace(/광주광역시/g, "광주")
    .replace(/대전광역시/g, "대전")
    .replace(/울산광역시/g, "울산")
    .replace(/세종특별자치시/g, "세종")
    .replace(/경기도/g, "경기")
    .replace(/강원특별자치도/g, "강원")
    .replace(/충청북도/g, "충북")
    .replace(/충청남도/g, "충남")
    .replace(/전라북도/g, "전북")
    .replace(/전라남도/g, "전남")
    .replace(/경상북도/g, "경북")
    .replace(/경상남도/g, "경남")
    .replace(/제주특별자치도/g, "제주")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * 한의원명과 주소로 DB에서 ID를 찾는 함수
 */
export async function findHospitalId(clinicName: string, address: string, prisma: any): Promise<number | null> {
  try {
    const normalizedInputName = normalizeName(clinicName);
    const normalizedInputAddress = normalizeAddress(address);

    // DB에서 모든 한의원을 가져와서 비교
    const hospitals = await prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        address: true,
      },
    });

    for (const hospital of hospitals) {
      const normalizedDbName = normalizeName(hospital.name);
      const normalizedDbAddress = normalizeAddress(hospital.address);

      // 이름이 일치하는지 확인 (한의원 제거 후 비교)
      const nameMatch =
        normalizedInputName === normalizedDbName ||
        normalizedInputName === normalizeName(hospital.name + "한의원") ||
        normalizeName(clinicName + "한의원") === normalizedDbName;

      // 도로명+건물번호 레벨에서 주소 일치 확인
      const addressMatch =
        normalizedDbAddress === normalizedInputAddress ||
        normalizedDbAddress.includes(normalizedInputAddress) ||
        normalizedInputAddress.includes(normalizedDbAddress);

      if (nameMatch && addressMatch) {
        return hospital.id;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error finding hospital ${clinicName}: ${(error as Error).message}`);
    return null;
  }
}