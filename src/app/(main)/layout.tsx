"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePathname } from "next/navigation";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

const getPageTitle = (pathname: string): string => {
  if (pathname === "/") return "홈";
  if (pathname === "/herbal-insurance") return "첩약 보험";
  if (pathname === "/non-covered") return "비급여 진료";
  if (pathname === "/reviews") return "한의원 후기";
  if (pathname === "/login") return "로그인";
  if (pathname === "/auth/kakao/callback") return "로그인 처리중";
  if (pathname === "/auth/additional-info") return "회원가입";
  if (pathname === "/auth/error") return "인증 오류";
  if (pathname === "/profile") return "프로필";
  if (pathname.startsWith("/profile/")) return "프로필 설정";
  if (pathname === "/onboarding/interests") return "관심 분야 선택";
  if (pathname.startsWith("/hospital/")) return "병원 상세";
  if (pathname.startsWith("/categories/")) return "카테고리";
  return "페이지";
};

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <MainLayout pageTitle={pageTitle}>
      {children}
      <Toaster />
    </MainLayout>
  );
}
