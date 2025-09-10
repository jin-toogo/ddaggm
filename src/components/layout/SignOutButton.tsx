"use client";

import React, { useState } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
// signOut은 서버 액션이므로 클라이언트에서 직접 사용 불가

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // 로그아웃 API 호출
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      // 페이지 새로고침으로 세션 상태 업데이트
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="text-red-600 focus:text-red-600 cursor-pointer"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isSigningOut ? '로그아웃 중...' : '로그아웃'}
    </DropdownMenuItem>
  );
}