"use client";

import React, { useEffect, useCallback } from "react";
import { X, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SocialLoginButtons } from "./SocialLoginButtons";

interface LoginPromptOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  totalReviews?: number;
  showReviews?: number;
}

export function LoginPromptOverlay({
  isOpen,
  onClose,
  totalReviews = 100,
  showReviews = 10,
}: LoginPromptOverlayProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // 스크롤 방지
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // 배경 클릭시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
      aria-describedby="login-prompt-description"
    >
      <Card className="max-w-md w-full mx-4 animate-in zoom-in-95 duration-300 shadow-2xl border-0">
        <CardContent className="p-4 sm:p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <h2
                id="login-prompt-title"
                className="text-lg sm:text-xl font-semibold"
              >
                더 많은 후기를 보려면 로그인하세요
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 설명 */}
          <div id="login-prompt-description" className="mb-6">
            <p className="text-gray-600 mb-4">
              현재 <strong>{showReviews}개</strong>의 후기를 확인했습니다.
              <br />
              <strong>{totalReviews.toLocaleString()}+</strong>개의 모든 후기를
              보려면 로그인해주세요!
            </p>

            {/* 혜택 목록 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100+ 선별된 한의원 후기 무제한 열람</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>개인화된 후기 추천</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>관심 지역 후기 우선 표시</span>
              </div>
            </div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="mb-4">
            <SocialLoginButtons redirectUrl="/reviews" />
          </div>

          {/* 나중에 하기 */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              나중에 하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
