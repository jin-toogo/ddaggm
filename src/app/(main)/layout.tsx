"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePathname } from "next/navigation";

const getPageTitle = (pathname: string): string => {
  if (pathname === "/") return "홈";
  if (pathname === "/herbal-insurance") return "첩약 보험";
  if (pathname === "/non-covered") return "비급여 진료";
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
    </MainLayout>
  );
}