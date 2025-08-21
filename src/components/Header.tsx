import Link from "next/link";
import React from "react";

export function Header() {
  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">
              DDaggm&nbsp;따끔
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              홈
            </Link>
            <Link
              href="/non-covered"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              비급여
            </Link>
            <Link
              href="https://forms.gle/ynAUn3fswwchot6s6"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              문의
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
