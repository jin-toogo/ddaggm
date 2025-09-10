"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Pill,
  DollarSign,
  MessageCircle,
  GanttChart,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  external?: boolean;
  type?: "auth" | "logout";
  onClick?: () => void;
}

const menuItems: MenuItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/herbal-insurance", label: "첩약 보험", icon: Pill },
  { href: "/non-covered", label: "비급여", icon: DollarSign },
  { href: "/reviews", label: "후기", icon: GanttChart },
  {
    href: "https://forms.gle/ynAUn3fswwchot6s6",
    label: "문의",
    icon: MessageCircle,
    external: true,
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // 사용자 상태에 따른 동적 메뉴 항목
  const userMenuItems: MenuItem[] = user
    ? [
        { href: "/profile", label: "프로필", icon: Settings, type: "auth" },
        {
          href: "#",
          label: "로그아웃",
          icon: LogOut,
          type: "logout",
          onClick: logout,
        },
      ]
    : [{ href: "/login", label: "로그인", icon: User, type: "auth" }];

  const allMenuItems: MenuItem[] = [...menuItems, ...userMenuItems];

  return (
    <div className="h-full flex flex-col">
      {/* 브랜드 */}
      <div className="px-5 py-4 fixed top-1 left-2">
        <Link href="/" className="cursor-pointer">
          <h1 className="text-xl font-semibold text-gray-900 hover:font-bold transition-all">
            DDaggm&nbsp;따끔
          </h1>
        </Link>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-2">
        <div className="space-y-2 flex flex-col gap-2 justify-center h-full">
          {allMenuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            // 로그아웃 버튼인 경우 클릭 핸들러 처리
            if (item.type === "logout") {
              return (
                <button
                  key={`${item.label}-${index}`}
                  onClick={() => {
                    item.onClick?.();
                    handleLinkClick();
                  }}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-red-50 hover:text-red-600 rounded-md text-gray-500 w-full text-left"
                >
                  <Icon size={22} />
                  <span className="text-lg font-semibold">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={`${item.href}-${index}`}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100 rounded-md ${
                  active
                    ? "text-gray-900 font-semibold bg-gray-50"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon size={22} />
                <span className="text-lg font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
