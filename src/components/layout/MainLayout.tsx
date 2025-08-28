"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { PageHeader } from "./PageHeader";
import { Menu, X } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export function MainLayout({ children, pageTitle }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed left-0 top-0 w-72 h-full z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* 메인 영역 */}
      <main className="min-h-screen">
        {/* 모바일 햄버거 버튼 */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 right-4 z-[60] p-2 rounded-md bg-white border border-gray-200 shadow-sm"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* 페이지 헤더 */}
        <div className="max-w-5xl mx-auto sticky top-0 bg-gray-50 px-8 z-20 flex justify-center ">
          <PageHeader title={pageTitle} />
        </div>

        {/* Thread 원본 스크롤 방식 - 자연스러운 전체 페이지 스크롤 */}
        <div className="px-4 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white border-x border-gray-200 shadow-sm p-4 lg:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
