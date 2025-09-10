"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import AccountDeletion from "@/components/auth/AccountDeletion";
import {
  User,
  Heart,
  Settings,
  Save,
  AlertCircle,
  Edit,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UserInterest {
  id: number;
  category: {
    id: number;
    name: string;
    icon: string;
    slug: string;
    description?: string;
  };
}

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  ageGroup: string;
  gender: string;
  provider: string;
  region?: string;
  privacyAgreed: boolean;
  marketingAgreed?: boolean;
  interests: UserInterest[];
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [region, setRegion] = useState("");
  const [nickname, setNickname] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalNickname, setOriginalNickname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 세션 확인
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // 프로필 데이터 로드
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/users/profile");

        if (!response.ok) {
          throw new Error("프로필을 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setProfile(data.user);
        setRegion(data.user.region || "");
        setNickname(data.user.nickname || "");
        setOriginalNickname(data.user.nickname || "");
      } catch (error) {
        console.error("Profile fetch error:", error);
        setError("프로필을 불러오는 중 오류가 발생했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;

    // 닉네임 유효성 검증
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }

    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      setError("닉네임은 2자 이상 20자 이하로 입력해주세요");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          region: region.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "프로필 저장에 실패했습니다");
      }

      const data = await response.json();
      setProfile(data.user);
      setNickname(data.user.nickname || "");
      setOriginalNickname(data.user.nickname || "");
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Profile save error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "프로필 저장 중 오류가 발생했습니다"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNickname(originalNickname);
    setError(null);
  };

  // 로딩 상태
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않음
  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-gray-600">프로필을 불러올 수 없습니다.</p>
          <Button onClick={() => router.push("/")}>홈으로 이동</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.nickname}
              </h1>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  {profile.provider === "naver" ? "네이버" : "카카오"} 계정
                </span>
                <span className="text-sm text-gray-500">
                  가입일:{" "}
                  {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>기본 정보</span>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditClick}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  수정
                </Button>
              )}
            </CardTitle>
            <CardDescription>프로필 기본 정보를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={
                  isEditing ? (e) => setNickname(e.target.value) : undefined
                }
                placeholder={isEditing ? "닉네임을 입력하세요" : ""}
                maxLength={20}
                disabled={!isEditing}
                className={
                  isEditing ? "border-gray-300 bg-white" : "bg-gray-50"
                }
              />
              {isEditing ? (
                <p className="text-xs text-gray-500">
                  2자 이상 20자 이하의 닉네임을 입력해주세요
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  수정 버튼을 눌러 닉네임을 변경할 수 있습니다
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* 연령대 */}
            <div className="space-y-2">
              <Label htmlFor="ageGroup">연령대</Label>
              <Input
                id="ageGroup"
                value={profile.ageGroup}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/*  성별 */}
            <div className="space-y-2">
              <Label htmlFor="gender">성별</Label>
              <Input
                id="gender"
                value={
                  profile.gender === "m"
                    ? "남성"
                    : profile.gender === "f"
                    ? "여성"
                    : "미선택"
                }
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="region">선호 지역</Label>
              <Input
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="예: 서울시 강남구, 부산시 해운대구"
                className="bg-white"
              />
              <p className="text-xs text-gray-500">
                선호하는 지역을 입력하면 해당 지역의 한의원을 우선
                추천해드립니다
              </p>
            </div> */}

            {/* 에러/성공 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-green-400">✓</div>
                  <p className="text-sm text-green-600">
                    프로필이 성공적으로 저장되었습니다
                  </p>
                </div>
              </div>
            )}

            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>저장 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>저장</span>
                    </div>
                  )}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 관심사 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>관심사</span>
            </CardTitle>
            <CardDescription>
              선택한 관심사에 따라 맞춤 한의원을 추천해드려요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.interests.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {profile.interests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      {/* <span className="text-lg">{interest.category.icon}</span> */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {interest.category.name}
                        </p>
                        {interest.category.description && (
                          <p className="text-xs text-blue-700">
                            {interest.category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">
                    선택된 관심사: {profile.interests.length}개
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile/interests">
                      <Heart className="h-4 w-4 mr-2" />
                      관심사 수정
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 py-6">
                <Heart className="h-12 w-12 text-gray-300 mx-auto" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    설정된 관심사가 없습니다
                  </p>
                  <p className="text-xs text-gray-500">
                    관심사를 선택하면 맞춤 한의원을 추천해드려요
                  </p>
                </div>
                <Button asChild className="mt-3">
                  <Link href="/profile/interests">
                    <Heart className="h-4 w-4 mr-2" />
                    관심사 선택하기
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 계정 삭제 섹션 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">계정 관리</h2>
          <AccountDeletion />
        </div>
      </div>
    </ErrorBoundary>
  );
}
