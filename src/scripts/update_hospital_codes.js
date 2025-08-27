const fs = require("fs");
const path = require("path");

// cities와 districts 배열 정의
const cities = [
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

const districts = {
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

// 시도코드명 매핑 함수
function mapCityName(oldCityName) {
  const cityMapping = {
    서울: "서울특별시",
    부산: "부산광역시",
    인천: "인천광역시",
    대구: "대구광역시",
    광주: "광주광역시",
    대전: "대전광역시",
    울산: "울산광역시",
    경기: "경기도",
    강원: "강원도",
    충북: "충청북도",
    충남: "충청남도",
    전북: "전라북도",
    전남: "전라남도",
    경북: "경상북도",
    경남: "경상남도",
    제주: "제주도",
  };

  return cityMapping[oldCityName] || oldCityName;
}

// 주소에서 시군구 추출 함수
function extractDistrictFromAddress(address, cityName) {
  if (!address || typeof address !== "string") {
    return null;
  }

  // 주소에서 시군구 패턴 찾기
  const patterns = [
    // 인천광역시 관련
    /인천\s*미추홀구/,
    /인천\s*중구/,
    /인천\s*동구/,
    /인천\s*남구/,
    /인천\s*남동구/,
    /인천\s*부평구/,
    /인천\s*계양구/,
    /인천\s*서구/,
    /인천\s*연수구/,
    /인천\s*강화군/,
    /인천\s*옹진군/,

    // 서울특별시 관련
    /서울\s*강남구/,
    /서울\s*강동구/,
    /서울\s*강북구/,
    /서울\s*강서구/,
    /서울\s*관악구/,
    /서울\s*광진구/,
    /서울\s*구로구/,
    /서울\s*금천구/,
    /서울\s*노원구/,
    /서울\s*도봉구/,
    /서울\s*동대문구/,
    /서울\s*동작구/,
    /서울\s*마포구/,
    /서울\s*서대문구/,
    /서울\s*서초구/,
    /서울\s*성동구/,
    /서울\s*성북구/,
    /서울\s*송파구/,
    /서울\s*양천구/,
    /서울\s*영등포구/,
    /서울\s*용산구/,
    /서울\s*은평구/,
    /서울\s*종로구/,
    /서울\s*중구/,
    /서울\s*중랑구/,

    // 부산광역시 관련
    /부산\s*강서구/,
    /부산\s*금정구/,
    /부산\s*남구/,
    /부산\s*동구/,
    /부산\s*동래구/,
    /부산\s*부산진구/,
    /부산\s*북구/,
    /부산\s*사상구/,
    /부산\s*사하구/,
    /부산\s*서구/,
    /부산\s*수영구/,
    /부산\s*연제구/,
    /부산\s*영도구/,
    /부산\s*중구/,
    /부산\s*해운대구/,
    /부산\s*기장군/,

    // 대구광역시 관련
    /대구\s*남구/,
    /대구\s*달서구/,
    /대구\s*동구/,
    /대구\s*북구/,
    /대구\s*서구/,
    /대구\s*수성구/,
    /대구\s*중구/,
    /대구\s*달성군/,

    // 광주광역시 관련
    /광주\s*광산구/,
    /광주\s*남구/,
    /광주\s*동구/,
    /광주\s*북구/,
    /광주\s*서구/,

    // 대전광역시 관련
    /대전\s*대덕구/,
    /대전\s*동구/,
    /대전\s*서구/,
    /대전\s*유성구/,
    /대전\s*중구/,

    // 울산광역시 관련
    /울산\s*남구/,
    /울산\s*동구/,
    /울산\s*북구/,
    /울산\s*중구/,
    /울산\s*울주군/,

    // 경기도 관련
    /수원\s*팔달구/,
    /수원\s*영통구/,
    /수원\s*장안구/,
    /수원\s*권선구/,
    /성남\s*수정구/,
    /성남\s*중원구/,
    /성남\s*분당구/,
    /고양\s*덕양구/,
    /고양\s*일산동구/,
    /고양\s*일산서구/,
    /용인\s*기흥구/,
    /용인\s*수지구/,
    /용인\s*처인구/,
    /안산\s*상록구/,
    /안산\s*단원구/,
    /안양\s*만안구/,
    /안양\s*동안구/,

    // 충청북도 관련
    /청주\s*상당구/,
    /청주\s*서원구/,
    /청주\s*흥덕구/,
    /청주\s*청원구/,

    // 충청남도 관련
    /천안\s*동남구/,
    /천안\s*서북구/,

    // 전라북도 관련
    /전주\s*완산구/,
    /전주\s*덕진구/,

    // 경상북도 관련
    /포항\s*남구/,
    /포항\s*북구/,

    // 경상남도 관련
    /창원\s*의창구/,
    /창원\s*성산구/,
    /창원\s*마산합포구/,
    /창원\s*마산회원구/,
    /창원\s*진해구/,
  ];

  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match) {
      const fullMatch = match[0];

      // 매핑 테이블
      const mapping = {
        // 인천광역시
        "인천 미추홀구": "미추홀구",
        "인천 중구": "중구",
        "인천 동구": "동구",
        "인천 남구": "남구",
        "인천 남동구": "남동구",
        "인천 부평구": "부평구",
        "인천 계양구": "계양구",
        "인천 서구": "서구",
        "인천 연수구": "연수구",
        "인천 강화군": "강화군",
        "인천 옹진군": "옹진군",

        // 서울특별시
        "서울 강남구": "강남구",
        "서울 강동구": "강동구",
        "서울 강북구": "강북구",
        "서울 강서구": "강서구",
        "서울 관악구": "관악구",
        "서울 광진구": "광진구",
        "서울 구로구": "구로구",
        "서울 금천구": "금천구",
        "서울 노원구": "노원구",
        "서울 도봉구": "도봉구",
        "서울 동대문구": "동대문구",
        "서울 동작구": "동작구",
        "서울 마포구": "마포구",
        "서울 서대문구": "서대문구",
        "서울 서초구": "서초구",
        "서울 성동구": "성동구",
        "서울 성북구": "성북구",
        "서울 송파구": "송파구",
        "서울 양천구": "양천구",
        "서울 영등포구": "영등포구",
        "서울 용산구": "용산구",
        "서울 은평구": "은평구",
        "서울 종로구": "종로구",
        "서울 중구": "중구",
        "서울 중랑구": "중랑구",

        // 부산광역시
        "부산 강서구": "강서구",
        "부산 금정구": "금정구",
        "부산 남구": "남구",
        "부산 동구": "동구",
        "부산 동래구": "동래구",
        "부산 부산진구": "부산진구",
        "부산 북구": "북구",
        "부산 사상구": "사상구",
        "부산 사하구": "사하구",
        "부산 서구": "서구",
        "부산 수영구": "수영구",
        "부산 연제구": "연제구",
        "부산 영도구": "영도구",
        "부산 중구": "중구",
        "부산 해운대구": "해운대구",
        "부산 기장군": "기장군",

        // 대구광역시
        "대구 남구": "남구",
        "대구 달서구": "달서구",
        "대구 동구": "동구",
        "대구 북구": "북구",
        "대구 서구": "서구",
        "대구 수성구": "수성구",
        "대구 중구": "중구",
        "대구 달성군": "달성군",

        // 광주광역시
        "광주 광산구": "광산구",
        "광주 남구": "남구",
        "광주 동구": "동구",
        "광주 북구": "북구",
        "광주 서구": "서구",

        // 대전광역시
        "대전 대덕구": "대덕구",
        "대전 동구": "동구",
        "대전 서구": "서구",
        "대전 유성구": "유성구",
        "대전 중구": "중구",

        // 울산광역시
        "울산 남구": "남구",
        "울산 동구": "동구",
        "울산 북구": "북구",
        "울산 중구": "중구",
        "울산 울주군": "울주군",

        // 경기도
        "수원 팔달구": "수원시",
        "수원 영통구": "수원시",
        "수원 장안구": "수원시",
        "수원 권선구": "수원시",
        "성남 수정구": "성남시",
        "성남 중원구": "성남시",
        "성남 분당구": "성남시",
        "고양 덕양구": "고양시",
        "고양 일산동구": "고양시",
        "고양 일산서구": "고양시",
        "용인 기흥구": "용인시",
        "용인 수지구": "용인시",
        "용인 처인구": "용인시",
        "안산 상록구": "안산시",
        "안산 단원구": "안산시",
        "안양 만안구": "안양시",
        "안양 동안구": "안양시",

        // 충청북도
        "청주 상당구": "청주시",
        "청주 서원구": "청주시",
        "청주 흥덕구": "청주시",
        "청주 청원구": "청주시",

        // 충청남도
        "천안 동남구": "천안시",
        "천안 서북구": "천안시",

        // 전라북도
        "전주 완산구": "전주시",
        "전주 덕진구": "전주시",

        // 경상북도
        "포항 남구": "포항시",
        "포항 북구": "포항시",

        // 경상남도
        "창원 의창구": "창원시",
        "창원 성산구": "창원시",
        "창원 마산합포구": "창원시",
        "창원 마산회원구": "창원시",
        "창원 진해구": "창원시",
      };

      if (mapping[fullMatch]) {
        return mapping[fullMatch];
      }
    }
  }

  return null;
}

// districts 배열에 정의된 값인지 검증하는 함수
function isValidDistrict(districtName, cityName) {
  if (!districts[cityName]) {
    return false;
  }
  return districts[cityName].includes(districtName);
}

// 시군구코드명 매핑 함수
function mapDistrictName(oldDistrictName, cityName, address) {
  // 주소에서 시군구 추출 시도
  if (address) {
    const extractedDistrict = extractDistrictFromAddress(address, cityName);
    if (extractedDistrict) {
      return extractedDistrict;
    }
  }

  // 이미 올바른 형태이고 districts 배열에 정의된 경우
  if (isValidDistrict(oldDistrictName, cityName)) {
    return oldDistrictName;
  }

  // 특별한 경우들 처리
  const specialCases = {
    // 수원시 관련
    수원팔달구: "수원시",
    수원영통구: "수원시",
    수원장안구: "수원시",
    수원권선구: "수원시",

    // 성남시 관련
    성남수정구: "성남시",
    성남중원구: "성남시",
    성남분당구: "성남시",

    // 고양시 관련
    고양덕양구: "고양시",
    고양일산동구: "고양시",
    고양일산서구: "고양시",

    // 용인시 관련
    용인기흥구: "용인시",
    용인수지구: "용인시",
    용인처인구: "용인시",

    // 안산시 관련
    안산상록구: "안산시",
    안산단원구: "안산시",

    // 안양시 관련
    안양만안구: "안양시",
    안양동안구: "안양시",

    // 기타 시
    평택시: "평택시",
    포천시: "포천시",
    하남시: "하남시",
    화성시: "화성시",

    // 군
    가평군: "가평군",
    양평군: "양평군",
    여주군: "여주군",
    연천군: "연천군",
  };

  // 특별한 경우가 있으면 반환
  if (specialCases[oldDistrictName]) {
    return specialCases[oldDistrictName];
  }

  // 부산광역시 관련 특별 처리
  if (cityName === "부산광역시") {
    const busanMapping = {
      부산강서구: "강서구",
      부산금정구: "금정구",
      부산남구: "남구",
      부산동구: "동구",
      부산동래구: "동래구",
      부산부산진구: "부산진구",
      부산북구: "북구",
      부산사상구: "사상구",
      부산사하구: "사하구",
      부산서구: "서구",
      부산수영구: "수영구",
      부산연제구: "연제구",
      부산영도구: "영도구",
      부산중구: "중구",
      부산해운대구: "해운대구",
      부산기장군: "기장군",
      // 이미 올바른 형태인 경우들
      부산진구: "부산진구",
      강서구: "강서구",
      금정구: "금정구",
      남구: "남구",
      동구: "동구",
      동래구: "동래구",
      북구: "북구",
      사상구: "사상구",
      사하구: "사하구",
      서구: "서구",
      수영구: "수영구",
      연제구: "연제구",
      영도구: "영도구",
      중구: "중구",
      해운대구: "해운대구",
      기장군: "기장군",
    };

    if (busanMapping[oldDistrictName]) {
      return busanMapping[oldDistrictName];
    }
  }

  // 서울특별시 관련 특별 처리
  if (cityName === "서울특별시") {
    const seoulMapping = {
      서울강남구: "강남구",
      서울강동구: "강동구",
      서울강북구: "강북구",
      서울강서구: "강서구",
      서울관악구: "관악구",
      서울광진구: "광진구",
      서울구로구: "구로구",
      서울금천구: "금천구",
      서울노원구: "노원구",
      서울도봉구: "도봉구",
      서울동대문구: "동대문구",
      서울동작구: "동작구",
      서울마포구: "마포구",
      서울서대문구: "서대문구",
      서울서초구: "서초구",
      서울성동구: "성동구",
      서울성북구: "성북구",
      서울송파구: "송파구",
      서울양천구: "양천구",
      서울영등포구: "영등포구",
      서울용산구: "용산구",
      서울은평구: "은평구",
      서울종로구: "종로구",
      서울중구: "중구",
      서울중랑구: "중랑구",
      // 이미 올바른 형태인 경우들
      강남구: "강남구",
      강동구: "강동구",
      강북구: "강북구",
      강서구: "강서구",
      관악구: "관악구",
      광진구: "광진구",
      구로구: "구로구",
      금천구: "금천구",
      노원구: "노원구",
      도봉구: "도봉구",
      동대문구: "동대문구",
      동작구: "동작구",
      마포구: "마포구",
      서대문구: "서대문구",
      서초구: "서초구",
      성동구: "성동구",
      성북구: "성북구",
      송파구: "송파구",
      양천구: "양천구",
      영등포구: "영등포구",
      용산구: "용산구",
      은평구: "은평구",
      종로구: "종로구",
      중구: "중구",
      중랑구: "중랑구",
    };

    if (seoulMapping[oldDistrictName]) {
      return seoulMapping[oldDistrictName];
    }
  }

  // 인천광역시 관련 특별 처리
  if (cityName === "인천광역시") {
    const incheonMapping = {
      인천계양구: "계양구",
      인천남구: "남구",
      인천남동구: "남동구",
      인천동구: "동구",
      인천부평구: "부평구",
      인천서구: "서구",
      인천연수구: "연수구",
      인천중구: "중구",
      인천강화군: "강화군",
      인천옹진군: "옹진군",
      인천미추홀구: "미추홀구",
      // 이미 올바른 형태인 경우들
      계양구: "계양구",
      남구: "남구",
      남동구: "남동구",
      동구: "동구",
      부평구: "부평구",
      서구: "서구",
      연수구: "연수구",
      중구: "중구",
      강화군: "강화군",
      옹진군: "옹진군",
      미추홀구: "미추홀구",
    };

    if (incheonMapping[oldDistrictName]) {
      return incheonMapping[oldDistrictName];
    }
  }

  // 대구광역시 관련 특별 처리
  if (cityName === "대구광역시") {
    const daeguMapping = {
      대구남구: "남구",
      대구달서구: "달서구",
      대구동구: "동구",
      대구북구: "북구",
      대구서구: "서구",
      대구수성구: "수성구",
      대구중구: "중구",
      대구달성군: "달성군",
      대구군위군: "군위군",
      // 이미 올바른 형태인 경우들
      남구: "남구",
      달서구: "달서구",
      동구: "동구",
      북구: "북구",
      서구: "서구",
      수성구: "수성구",
      중구: "중구",
      달성군: "달성군",
      군위군: "군위군",
    };

    if (daeguMapping[oldDistrictName]) {
      return daeguMapping[oldDistrictName];
    }
  }

  // 광주광역시 관련 특별 처리
  if (cityName === "광주광역시") {
    const gwangjuMapping = {
      광주광산구: "광산구",
      광주남구: "남구",
      광주동구: "동구",
      광주북구: "북구",
      광주서구: "서구",
    };

    if (gwangjuMapping[oldDistrictName]) {
      return gwangjuMapping[oldDistrictName];
    }
  }

  // 대전광역시 관련 특별 처리
  if (cityName === "대전광역시") {
    const daejeonMapping = {
      대전대덕구: "대덕구",
      대전동구: "동구",
      대전서구: "서구",
      대전유성구: "유성구",
      대전중구: "중구",
    };

    if (daejeonMapping[oldDistrictName]) {
      return daejeonMapping[oldDistrictName];
    }
  }

  // 울산광역시 관련 특별 처리
  if (cityName === "울산광역시") {
    const ulsanMapping = {
      울산남구: "남구",
      울산동구: "동구",
      울산북구: "북구",
      울산중구: "중구",
      울산울주군: "울주군",
    };

    if (ulsanMapping[oldDistrictName]) {
      return ulsanMapping[oldDistrictName];
    }
  }

  // 충청북도 관련 특별 처리
  if (cityName === "충청북도") {
    const chungbukMapping = {
      청주상당구: "청주시",
      청주서원구: "청주시",
      청주흥덕구: "청주시",
      청주청원구: "청주시",
      충주시: "충주시",
      제천시: "제천시",
    };

    if (chungbukMapping[oldDistrictName]) {
      return chungbukMapping[oldDistrictName];
    }
  }

  // 충청남도 관련 특별 처리
  if (cityName === "충청남도") {
    const chungnamMapping = {
      천안동남구: "천안시",
      천안서북구: "천안시",
      공주시: "공주시",
      보령시: "보령시",
      아산시: "아산시",
      서산시: "서산시",
      논산시: "논산시",
      계룡시: "계룡시",
    };

    if (chungnamMapping[oldDistrictName]) {
      return chungnamMapping[oldDistrictName];
    }
  }

  // 전라북도 관련 특별 처리
  if (cityName === "전라북도") {
    const jeonbukMapping = {
      전주완산구: "전주시",
      전주덕진구: "전주시",
      군산시: "군산시",
      익산시: "익산시",
      정읍시: "정읍시",
      남원시: "남원시",
      김제시: "김제시",
    };

    if (jeonbukMapping[oldDistrictName]) {
      return jeonbukMapping[oldDistrictName];
    }
  }

  // 전라남도 관련 특별 처리
  if (cityName === "전라남도") {
    const jeonnamMapping = {
      목포시: "목포시",
      여수시: "여수시",
      순천시: "순천시",
      나주시: "나주시",
      광양시: "광양시",
    };

    if (jeonnamMapping[oldDistrictName]) {
      return jeonnamMapping[oldDistrictName];
    }
  }

  // 경상북도 관련 특별 처리
  if (cityName === "경상북도") {
    const gyeongbukMapping = {
      포항남구: "포항시",
      포항북구: "포항시",
      경주시: "경주시",
      김천시: "김천시",
      안동시: "안동시",
      구미시: "구미시",
      영주시: "영주시",
      영천시: "영천시",
      상주시: "상주시",
      문경시: "문경시",
      경산시: "경산시",
    };

    if (gyeongbukMapping[oldDistrictName]) {
      return gyeongbukMapping[oldDistrictName];
    }
  }

  // 경상남도 관련 특별 처리
  if (cityName === "경상남도") {
    const gyeongnamMapping = {
      창원의창구: "창원시",
      창원성산구: "창원시",
      창원마산합포구: "창원시",
      창원마산회원구: "창원시",
      창원진해구: "창원시",
      진주시: "진주시",
      통영시: "통영시",
      사천시: "사천시",
      김해시: "김해시",
      밀양시: "밀양시",
      거제시: "거제시",
      양산시: "양산시",
    };

    if (gyeongnamMapping[oldDistrictName]) {
      return gyeongnamMapping[oldDistrictName];
    }
  }

  // 강원도 관련 특별 처리
  if (cityName === "강원도") {
    const gangwonMapping = {
      춘천시: "춘천시",
      원주시: "원주시",
      강릉시: "강릉시",
      동해시: "동해시",
      태백시: "태백시",
      속초시: "속초시",
      삼척시: "삼척시",
    };

    if (gangwonMapping[oldDistrictName]) {
      return gangwonMapping[oldDistrictName];
    }
  }

  // 제주도 관련 특별 처리
  if (cityName === "제주도") {
    const jejuMapping = {
      제주시: "제주시",
      서귀포시: "서귀포시",
    };

    if (jejuMapping[oldDistrictName]) {
      return jejuMapping[oldDistrictName];
    }
  }

  // 일반적인 경우: "구" 또는 "군"으로 끝나는 경우
  if (oldDistrictName.endsWith("구") || oldDistrictName.endsWith("군")) {
    return oldDistrictName;
  }

  // "시"로 끝나는 경우
  if (oldDistrictName.endsWith("시")) {
    return oldDistrictName;
  }

  // 기본값: 원래 이름 반환
  return oldDistrictName;
}

// 메인 처리 함수
function updateHospitalCodes() {
  try {
    // hospital_master.json 파일 읽기
    const inputPath = path.join(__dirname, "..", "..", "hospital_master.json");
    const outputPath = path.join(
      __dirname,
      "..",
      "..",
      "hospital_master_updated.json"
    );

    console.log("파일을 읽는 중...");
    const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

    console.log(`총 ${data.length}개의 병원 데이터를 처리합니다...`);

    let updatedCount = 0;
    let cityUpdatedCount = 0;
    let districtUpdatedCount = 0;

    // 각 병원 데이터 처리
    const updatedData = data.map((hospital, index) => {
      const originalCity = hospital["base_시도코드명"];
      const originalDistrict = hospital["base_시군구코드명"];

      // 시도코드명 업데이트
      const newCity = mapCityName(originalCity);
      if (newCity !== originalCity) {
        cityUpdatedCount++;
        console.log(
          `[${index + 1}] 시도코드명 변경: ${originalCity} → ${newCity}`
        );
      }

      // 시군구코드명 업데이트
      const newDistrict = mapDistrictName(
        originalDistrict,
        newCity,
        hospital["base_주소"]
      );
      if (newDistrict !== originalDistrict) {
        districtUpdatedCount++;
        console.log(
          `[${
            index + 1
          }] 시군구코드명 변경: ${originalDistrict} → ${newDistrict}`
        );
      }

      // 업데이트된 데이터 반환
      return {
        ...hospital,
        base_시도코드명: newCity,
        base_시군구코드명: newDistrict,
      };
    });

    // 결과 파일 저장
    fs.writeFileSync(outputPath, JSON.stringify(updatedData, null, 2), "utf8");

    console.log("\n=== 처리 완료 ===");
    console.log(`총 병원 수: ${data.length}`);
    console.log(`시도코드명 변경: ${cityUpdatedCount}개`);
    console.log(`시군구코드명 변경: ${districtUpdatedCount}개`);
    console.log(`출력 파일: ${outputPath}`);

    // 변경된 데이터 샘플 출력
    console.log("\n=== 변경된 데이터 샘플 ===");
    const changedSamples = updatedData
      .filter((hospital, index) => {
        const original = data[index];
        return (
          hospital["base_시도코드명"] !== original["base_시도코드명"] ||
          hospital["base_시군구코드명"] !== original["base_시군구코드명"]
        );
      })
      .slice(0, 5);

    changedSamples.forEach((hospital, index) => {
      const original =
        data[
          data.findIndex(
            (h) => h["암호화요양기호"] === hospital["암호화요양기호"]
          )
        ];
      console.log(`\n샘플 ${index + 1}:`);
      console.log(`  병원명: ${hospital["base_요양기관명"]}`);
      console.log(
        `  시도: ${original["base_시도코드명"]} → ${hospital["base_시도코드명"]}`
      );
      console.log(
        `  시군구: ${original["base_시군구코드명"]} → ${hospital["base_시군구코드명"]}`
      );
    });
  } catch (error) {
    console.error("오류 발생:", error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  updateHospitalCodes();
}

module.exports = {
  mapCityName,
  mapDistrictName,
  updateHospitalCodes,
};
