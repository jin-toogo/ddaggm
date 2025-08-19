import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              DDaGGm&nbsp;따끔
            </h3>
            <p className="text-sm text-muted-foreground">
              한의원명으로 보험 적용 여부를 쉽게 확인할 수 있는 서비스입니다.
            </p>
          </div>

          <div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://forms.gle/ynAUn3fswwchot6s6"
                  target="_blank"
                  className="hover:text-foreground transition-colors"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <p>운영시간: 평일 9:00 - 18:00</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 한의원 보험 적용 확인. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
