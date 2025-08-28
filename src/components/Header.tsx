"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-[1000px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center space-x-4">
            <Link href="/" className="cursor-pointer">
              <h1 className="text-xl font-semibold text-foreground">
                DDaggm&nbsp;따끔
              </h1>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2 ">
            <Link
              href="/"
              className={`text-base hover:text-foreground py-4.5 transition-colors ${
                pathname === "/"
                  ? "text-foreground font-semibold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              홈
            </Link>
            <Link
              href="/herbal-insurance"
              className={`text-base hover:text-foreground py-4.5 transition-colors ${
                pathname === "/herbal-insurance"
                  ? "text-foreground font-semibold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              첩약 보험
            </Link>
            <Link
              href="/non-covered"
              className={`text-base hover:text-foreground py-4.5 transition-colors ${
                pathname === "/non-covered"
                  ? "text-foreground font-semibold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              비급여
            </Link>
            <Link
              href="https://forms.gle/ynAUn3fswwchot6s6"
              target="_blank"
              className="text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              문의
            </Link>
          </nav>
          <div className="flex items-center space-x-4">&nbsp;</div>
        </div>
      </div>
    </header>
  );
}
