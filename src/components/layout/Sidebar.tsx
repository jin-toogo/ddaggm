"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { Home, Pill, DollarSign, MessageCircle } from "lucide-react";

const menuItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/herbal-insurance", label: "첩약 보험", icon: Pill },
  { href: "/non-covered", label: "비급여", icon: DollarSign },
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
      <nav className="flex-1 p-4">
        <div className="space-y-2 flex flex-col gap-2 justify-center h-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100 rounded-md w-fit ${
                  active
                    ? "text-gray-900 font-semibold"
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
