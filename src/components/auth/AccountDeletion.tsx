"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AccountDeletion() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstConfirm = () => {
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  const handleFinalDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // 성공적으로 삭제됨
        toast.success("회원탈퇴가 완료되었습니다.");

        // 클라이언트 측 쿠키 강제 삭제
        document.cookie =
          "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // 로컬 스토리지도 정리 (혹시 사용하는 경우)
        localStorage.clear();
        sessionStorage.clear();

        // 페이지 완전 새로고침으로 모든 상태 초기화
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "회원탈퇴 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      toast.error("회원탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
  };

  return (
    <div className="border  rounded-lg p-6 ">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold  mb-2">계정 삭제</h3>
          <p className="text-sm mb-4">
            계정을 삭제하면 모든 개인정보와 관심사 설정이 영구적으로 삭제되며,
            이 작업은 되돌릴 수 없습니다.
          </p>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                계정 삭제
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  계정 삭제 확인
                </DialogTitle>
                <div className="text-sm text-muted-foreground text-left">
                  <p>정말로 계정을 삭제하시겠습니까?</p>
                  <br />
                  <p>
                    <strong className="text-red-600">주의사항:</strong>
                  </p>
                  <ul className="mt-2 ml-4 space-y-1 list-disc">
                    <li>모든 개인정보가 영구적으로 삭제됩니다</li>
                    <li>관심사 설정과 선호도 데이터가 삭제됩니다</li>
                    <li>이 작업은 되돌릴 수 없습니다</li>
                  </ul>
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  취소
                </Button>
                <Button variant="destructive" onClick={handleFirstConfirm}>
                  삭제 진행
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 최종 확인 다이얼로그 */}
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  최종 확인
                </DialogTitle>
                <DialogDescription className="text-left">
                  <strong className="text-red-800">
                    정말로 계정을 삭제하시겠습니까?
                  </strong>
                  <br />
                  <br />이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로
                  삭제됩니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleFinalDelete}
                  disabled={isLoading}
                >
                  {isLoading ? "삭제 중..." : "영구 삭제"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
