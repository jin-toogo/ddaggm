export interface HospitalData {
  id: number;
  encryptedCode: string;
  name: string;
  type: string;
  province: string;
  district: string;
  dong: string | null;
  postalCode: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  naverBlogUrl: string | null;
  establishedDate: string | null;
  totalDoctors: number | null;
  insurance: boolean;
  locationDetails?: {
    landmark: string | null;
    direction: string | null;
    distance: string | null;
    parkingSpaces: number | null;
    parkingFeeRequired: string | null;
    parkingNotes: string | null;
  };
  operatingHours?: {
    sundayInfo: string | null;
    holidayInfo: string | null;
    lunchWeekday: string | null;
    lunchSaturday: string | null;
    receptionWeekday: string | null;
    receptionSaturday: string | null;
    sunStart: string | null;
    sunEnd: string | null;
    monStart: string | null;
    monEnd: string | null;
    tueStart: string | null;
    tueEnd: string | null;
    wedStart: string | null;
    wedEnd: string | null;
    thuStart: string | null;
    thuEnd: string | null;
    friStart: string | null;
    friEnd: string | null;
    satStart: string | null;
    satEnd: string | null;
  };
  nonPaymentItems?: NonPaymentItem[];
}

export interface NonPaymentItem {
  id: number;
  npayCode: string | null;
  category: string | null;
  treatmentName: string | null;
  amount: number | null;
  yadmNm: string | null;
}

export interface HospitalImportData {
  암호화요양기호: string;
  base_요양기관명: string;
  base_종별코드명: string;
  base_시도코드명: string;
  base_시군구코드명: string;
  base_읍면동?: string;
  base_우편번호?: string;
  base_주소: string;
  base_전화번호?: string;
  base_병원홈페이지?: string;
  base_개설일자?: string;
  base_총의사수?: string;
  'base_좌표(X)'?: string;
  'base_좌표(Y)'?: string;
  '세부_위치_공공건물(장소)명'?: string;
  세부_위치_방향?: string;
  세부_위치_거리?: string;
  세부_주차_가능대수?: string;
  '세부_주차_비용 부담여부'?: string;
  '세부_주차_기타 안내사항'?: string;
  세부_휴진안내_일요일?: string;
  세부_휴진안내_공휴일?: string;
  세부_점심시간_평일?: string;
  세부_점심시간_토요일?: string;
  세부_접수시간_평일?: string;
  세부_접수시간_토요일?: string;
  세부_진료시작시간_일요일?: string;
  세부_진료종료시간_일요일?: string;
  세부_진료시작시간_월요일?: string;
  세부_진료종료시간_월요일?: string;
  세부_진료시작시간_화요일?: string;
  세부_진료종료시간_화요일?: string;
  세부_진료시작시간_수요일?: string;
  세부_진료종료시간_수요일?: string;
  세부_진료시작시간_목요일?: string;
  세부_진료종료시간_목요일?: string;
  세부_진료시작시간_금요일?: string;
  세부_진료종료시간_금요일?: string;
  세부_진료시작시간_토요일?: string;
  세부_진료종료시간_토요일?: string;
  insurance: boolean;
}