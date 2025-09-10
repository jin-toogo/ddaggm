'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Heart, ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  className?: string;
  showInterests?: boolean;
}

export function UserProfile({ className, showInterests = false }: UserProfileProps) {
  const { user, logout } = useAuth();

  // 로그인되지 않은 경우 로그인 버튼 표시
  if (!user) {
    return (
      <Link href="/login" className={className}>
        <Button 
          variant="outline" 
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <User className="h-5 w-5 mr-3" />
          로그인
        </Button>
      </Link>
    );
  }

  // 로그인된 경우 프로필 드롭다운
  return (
    <div className={`${className}`} data-testid="user-profile">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-3 h-auto"
          >
            {/* 프로필 이미지 */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.nickname || '사용자'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* 사용자 이름 */}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nickname || '사용자'}
              </p>
              {user?.provider && (
                <p className="text-xs text-gray-500">
                  {user.provider === 'naver' ? '네이버' : '카카오'}
                </p>
              )}
            </div>

            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.nickname}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* 관심사 표시 */}
          {showInterests && user?.interests && (
            <>
              <div className="px-2 py-1">
                <p className="text-xs text-gray-500 mb-1">관심사</p>
                {user.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.interests.slice(0, 3).map(interest => (
                      <span
                        key={interest.id}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {interest.category.icon} {interest.category.name}
                      </span>
                    ))}
                    {user.interests.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{user.interests.length - 3}개 더
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">설정되지 않음</span>
                )}
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* 메뉴 항목들 */}
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              프로필 관리
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/profile/interests" className="cursor-pointer">
              <Heart className="h-4 w-4 mr-2" />
              관심사 수정
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={logout}
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}