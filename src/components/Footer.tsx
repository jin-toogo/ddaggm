import React from "react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              한의원 보험 적용 확인
            </h3>
            <p className="text-sm text-muted-foreground">
              한의원명으로 보험 적용 여부를 쉽게 확인할 수 있는 서비스입니다.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">유용한 링크</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  도움말
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">연락처</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>이메일: contact@hanmedi.com</p>
              <p>전화: 02-1234-5678</p>
              <p>운영시간: 평일 9:00 - 18:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 한의원 보험 적용 확인. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
