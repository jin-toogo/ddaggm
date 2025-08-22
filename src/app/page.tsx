import React, { Suspense } from "react";
import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NonCoveredContent } from "@/components/NonCoveredContent";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "한의원 비급여 진료 항목 - 치료법별 가격 비교",
  description: "한의원 비급여 진료 항목과 가격 정보를 치료법별로 확인하고 비교하세요. 추나요법, 침술, 부항 등 다양한 한방 치료의 비급여 정보를 제공합니다.",
  keywords: [
    "한의원",
    "비급여",
    "추나요법",
    "침술",
    "부항",
    "한방치료",
    "치료비",
    "가격비교",
    "한의원비용"
  ],
  openGraph: {
    title: "한의원 비급여 진료 항목 - 치료법별 가격 비교",
    description: "한의원 비급여 진료 항목과 가격을 치료법별로 비교해보세요.",
    type: "website",
    locale: "ko_KR",
    url: "https://ddaggm.com/non-covered",
  },
  twitter: {
    card: "summary_large_image",
    title: "한의원 비급여 진료 항목",
    description: "한의원 비급여 진료 항목과 가격을 치료법별로 비교해보세요.",
  },
  alternates: {
    canonical: "https://ddaggm.com/non-covered",
  },
};

export default function NonCoveredPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StructuredData type="non-payment" />
      <Header />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                비급여 데이터를 불러오는 중...
              </p>
            </div>
          </main>
        }
      >
        <NonCoveredContent />
      </Suspense>
      <Footer />
    </div>
  );
}