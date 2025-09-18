"use client";

interface StructuredDataProps {
  type:
    | "website"
    | "medical-business"
    | "hospital"
    | "non-payment"
    | "herbal-supplements";
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: any = {};

  switch (type) {
    case "website":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "한의원 보험 적용 확인",
        description:
          "한의원명으로 보험 적용 여부를 쉽게 확인할 수 있는 서비스입니다. 한방 첩약 보험 적용 정보를 제공합니다.",
        url: "https://ddaggm.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://ddaggm.com/?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
        publisher: {
          "@type": "Organization",
          "@id": "https://ddaggm.com/#organization",
        },
      };
      break;

    case "medical-business":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        name: "한의원 보험 적용 확인 서비스",
        description:
          "전국 한의원의 보험 적용 여부와 비급여 진료 항목을 확인할 수 있는 의료 정보 플랫폼",
        url: "https://ddaggm.com",
        medicalSpecialty: [
          "한의학",
          "추나요법",
          "침술",
          "한방내과",
          "한방재활의학",
        ],
        serviceType: [
          "보험 적용 확인",
          "비급여 진료비 조회",
          "한의원 찾기",
          "치료비 비교",
        ],
        areaServed: {
          "@type": "Country",
          name: "대한민국",
        },
      };
      break;

    case "hospital":
      if (data) {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Hospital",
          name: data.name,
          description: `${data.name} - 한의원 정보 및 보험 적용 여부`,
          address: {
            "@type": "PostalAddress",
            addressCountry: "KR",
            addressRegion: data.province,
            addressLocality: data.district,
            streetAddress: data.address,
          },
          telephone: data.phone,
          medicalSpecialty: "한의학",
          url: `https://ddaggm.com/hospital/${data.id}`,
          geo:
            data.latitude && data.longitude
              ? {
                  "@type": "GeoCoordinates",
                  latitude: data.latitude,
                  longitude: data.longitude,
                }
              : undefined,
        };
      }
      break;

    case "non-payment":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        name: "한의원 비급여 진료 항목",
        description:
          "한의원 비급여 진료 항목과 가격 정보를 확인할 수 있습니다.",
        medicalAudience: {
          "@type": "Patient",
        },
        about: {
          "@type": "MedicalCondition",
          name: "한방 치료",
        },
        mainContentOfPage: {
          "@type": "MedicalWebPage",
          specialty: "한의학",
        },
      };
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
