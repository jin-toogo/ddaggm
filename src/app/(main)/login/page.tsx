import React from "react";
import { Metadata } from "next";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import Link from "next/link";

export const metadata: Metadata = {
  title: "로그인 | 따끔",
  description:
    "네이버 또는 카카오 계정으로 간편하게 로그인하고 맞춤 한의원을 찾아보세요.",
};

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto py-8 h-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            간편하게 시작해보세요
          </h1>
          <p className="text-gray-600">
            네이버 또는 카카오 계정으로 로그인하고
            <br />
            맞춤 한의원 추천을 받아보세요
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="py-8 px-6 rounded-xl mb-8">
          <SocialLoginButtons />
        </div>

        {/* 하단 안내 */}
        <div className="text-center mb-8">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              로그인 시{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                개인정보 처리방침
              </Link>{" "}
              및{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                이용약관
              </Link>
              에 동의한 것으로 간주됩니다.
            </p>
          </div>
        </div>

        {/* 특징 소개 */}
        <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-medium text-gray-900 mb-1">첩약 보험 정보</h3>
            <p className="text-sm text-gray-600">첩약 보험 적용 한의원 찾기</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-medium text-gray-900 mb-1">비급여 정보</h3>
            <p className="text-sm text-gray-600">투명한 치료비 정보 제공</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-medium text-gray-900 mb-1">리뷰 정보</h3>
            <p className="text-sm text-gray-600">실제 이용자 후기 및 평가</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
