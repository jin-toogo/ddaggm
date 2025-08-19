import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Clock,
  MapPin,
  Car,
  Info,
} from "lucide-react";
import Link from "next/link";
import NonPaymentItems from "@/components/NonPaymentItems";

interface HospitalData {
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

interface NonPaymentItem {
  id: number;
  npayCode: string | null;
  category: string | null;
  treatmentName: string | null;
  amount: number | null;
  yadmNm: string | null;
}

async function getHospitalData(id: string): Promise<HospitalData | null> {
  try {
    // 서버 사이드에서는 내부 URL 사용, 클라이언트에서는 외부 URL 사용
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        : "https://ddaggm.com";

    const response = await fetch(`${baseUrl}/api/hospitals/${id}`, {});
    if (!response.ok) {
      return null;
    }
    const result = await response.json();
    console.log("API response:", result);
    // API가 { data: hospital } 형태로 반환하므로 data 속성에서 추출
    return result.data || result;
  } catch (error) {
    console.error("Error fetching hospital data:", error);
    return null;
  }
}

function formatTime(timeString: string | null): string {
  if (!timeString) return "";

  // ISO 날짜 형식 (1970-01-01T09:00:00.000Z) 처리
  if (timeString.includes("T") || timeString.includes("1970")) {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // DB에서 TIME 타입이 "HH:MM:SS" 형식으로 오는 경우를 처리
  if (timeString.includes(":")) {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  }

  // 기존 4자리 문자열 형식 ("HHMM") 처리
  if (timeString.length === 4) {
    const hours = timeString.substring(0, 2);
    const minutes = timeString.substring(2, 4);
    return `${hours}:${minutes}`;
  }

  return timeString;
}

export default async function HospitalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hospital = await getHospitalData(id);
  console.log("hospital :>> ", hospital);
  if (!hospital) {
    notFound();
  }

  const operatingHours = [
    {
      day: "월요일",
      start: hospital.operatingHours?.monStart,
      end: hospital.operatingHours?.monEnd,
    },
    {
      day: "화요일",
      start: hospital.operatingHours?.tueStart,
      end: hospital.operatingHours?.tueEnd,
    },
    {
      day: "수요일",
      start: hospital.operatingHours?.wedStart,
      end: hospital.operatingHours?.wedEnd,
    },
    {
      day: "목요일",
      start: hospital.operatingHours?.thuStart,
      end: hospital.operatingHours?.thuEnd,
    },
    {
      day: "금요일",
      start: hospital.operatingHours?.friStart,
      end: hospital.operatingHours?.friEnd,
    },
    {
      day: "토요일",
      start: hospital.operatingHours?.satStart,
      end: hospital.operatingHours?.satEnd,
    },
    {
      day: "일요일",
      start: hospital.operatingHours?.sunStart,
      end: hospital.operatingHours?.sunEnd,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">병원 정보</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hospital Name and Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {hospital.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {hospital.insurance && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    보험 적용
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {hospital.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <a
                  href={`tel:${hospital.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {hospital.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Non-Payment Items */}
        <NonPaymentItems items={hospital.nonPaymentItems || []} />

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">진료시간</h2>
          </div>

          <div className="space-y-2">
            {operatingHours.map(({ day, start, end }) => (
              <div key={day} className="flex justify-between items-center py-2">
                <span className="text-gray-700 font-medium w-16">{day}</span>
                <span className="text-gray-900">
                  {start && end
                    ? `${formatTime(start)} - ${formatTime(end)}`
                    : "휴진"}
                </span>
              </div>
            ))}
          </div>

          {(hospital.operatingHours?.lunchWeekday ||
            hospital.operatingHours?.lunchSaturday) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                점심시간
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                {hospital.operatingHours?.lunchWeekday && (
                  <p>평일: {hospital.operatingHours.lunchWeekday}</p>
                )}
                {hospital.operatingHours?.lunchSaturday && (
                  <p>토요일: {hospital.operatingHours.lunchSaturday}</p>
                )}
              </div>
            </div>
          )}

          {(hospital.operatingHours?.receptionWeekday ||
            hospital.operatingHours?.receptionSaturday) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                접수시간
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                {hospital.operatingHours?.receptionWeekday && (
                  <p>평일: {hospital.operatingHours.receptionWeekday}</p>
                )}
                {hospital.operatingHours?.receptionSaturday && (
                  <p>토요일: {hospital.operatingHours.receptionSaturday}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Parking Info */}
        {hospital.locationDetails?.parkingSpaces && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">주차 정보</h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">주차 가능 대수</span>
                <span className="text-gray-900">
                  {hospital.locationDetails.parkingSpaces}대
                </span>
              </div>

              {hospital.locationDetails?.parkingFeeRequired && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">주차 요금</span>
                  <span className="text-gray-900">
                    {hospital.locationDetails.parkingFeeRequired === "N"
                      ? "무료"
                      : "유료"}
                  </span>
                </div>
              )}

              {hospital.locationDetails?.parkingNotes && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {hospital.locationDetails.parkingNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(hospital.locationDetails?.landmark || hospital.totalDoctors) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">추가 정보</h2>
            </div>

            <div className="space-y-2">
              {hospital.locationDetails?.landmark && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">위치</span>
                  <span className="text-gray-900">
                    {hospital.locationDetails.landmark}
                  </span>
                </div>
              )}

              {hospital.totalDoctors && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">총 의사 수</span>
                  <span className="text-gray-900">
                    {hospital.totalDoctors}명
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">위치</h2>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-gray-900">{hospital.address}</p>
              <p className="text-sm text-gray-600">
                {hospital.province} {hospital.district} {hospital.dong}
              </p>
            </div>
            <Link
              href={`https://map.naver.com/p/${hospital.latitude},${hospital.longitude}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-sm  text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
            >
              <MapPin className="w-4 h-4" />
              지도 보기{" "}
            </Link>
          </div>
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <Link
              href={`https://map.naver.com/p/${hospital.latitude},${hospital.longitude}`}
              className="w-full h-full"
              target="_blank"
            >
              <img
                src={`https://maps.apigw.ntruss.com/map-static/v2/raster-cors?w=800&h=500&markers=type:d|size:mid|pos:${hospital.longitude}%20${hospital.latitude}&center=${hospital.longitude},${hospital.latitude}&level=16&scale=2&X-NCP-APIGW-API-KEY-ID=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}&X-NCP-APIGW-API-KEY=${process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET}`}
                alt="hospital-map"
                className="w-full h-full object-cover rounded-lg"
              />
            </Link>
            {/* <div className="text-center text-gray-600">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">지도 영역</p>
              {hospital.latitude && hospital.longitude && (
                <p className="text-xs">
                  좌표: {hospital.longitude}, {hospital.latitude}
                </p>
              )}
            </div> */}
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              위 정보의 저작권은 건강보험심사평가원에 있으며, 저작권법의 보호를
              받습니다.
            </p>
            <p className="text-xs text-gray-500">
              <Link
                href={`https://www.hira.or.kr/ra/hosp/hospInfoAjax.do?isNewWindow=Y&ykiho=${hospital.encryptedCode}`}
                target="_blank"
              >
                데이터 출처: 건강보험심사평가원 병원정보서비스
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
