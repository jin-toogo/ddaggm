"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User } from "@/lib/auth";
import { toast } from "sonner";

// Google Analytics dataLayer 타입 정의
declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData?: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || null;
        

        // 서버에서 invalidate 플래그가 온 경우 쿠키 정리
        if (data.invalidate) {
          document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          setUser(null);
          return null;
        }

        // 온보딩 중인 사용자인 경우
        if (data.pending) {
          setUser(null);
          return null;
        }

        // 세션 정보가 업데이트된 경우 쿠키도 업데이트
        if (userData && data.updated) {
          try {
            document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${
              60 * 60 * 24 * 7
            }; SameSite=Lax`;
          } catch (cookieError) {
            console.warn("쿠키 업데이트 실패:", cookieError);
          }
        }

        setUser(userData);
        return userData; // 업데이트된 user 데이터 반환
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setUser(null);
      return null;
    }
  };

  const login = (userData?: User) => {
    if (userData) {

      // 사용자 데이터가 제공된 경우, 즉시 로그인 상태 설정
      setUser(userData);

      // 가이드 호환: 추가로 쿠키에도 저장 (기존 JWT와 병행)
      try {
        document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`;
      } catch (error) {
        console.warn("쿠키 저장 실패:", error);
      }

      // 로그인 성공 시 dataLayer에 이벤트 푸시
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "login",
          user_id: userData.id,
        });
      } catch (error) {
        console.warn("dataLayer 푸시 실패:", error);
      }
    } else {
      // 사용자 데이터가 없는 경우, 로그인 페이지로 리다이렉트
      window.location.href = "/login";
    }
  };

  const logout = async () => {
    try {
      // 먼저 상태 초기화
      setUser(null);

      // API 호출
      await fetch("/api/auth/logout", { method: "POST" });

      // 클라이언트 측에서도 확실하게 쿠키 제거
      document.cookie =
        "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie =
        "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

      // toast가 보이도록 충분한 지연 후 리다이렉트
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      // 에러 발생시에도 로컬 상태는 초기화
      setUser(null);
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      toast.error("로그아웃 중 오류가 발생했습니다.");
      window.location.href = "/";
    }
  };

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
