"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Google Analytics dataLayer 타입 정의
declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface User {
  id: string;
  userId: string;
  email: string;
  nickname: string;
  profileImage?: string;
  provider: string;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  privacyAgreed: boolean;
  termsAgreed: boolean;
  marketingAgreed?: boolean;
  region?: string;
  ageGroup?: string;
  gender?: string;
  createdAt: string;
  interests?: Array<{
    id: number;
    categoryId: number;
    category: {
      id: number;
      name: string;
      slug: string;
      icon: string;
      description?: string;
    };
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData?: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  isPending: boolean;
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

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/token/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // 토큰 갱신 성공
        return true;
      }
      return false;
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      return false;
    }
  }, []);


  const login = (userData?: User) => {
    if (userData) {
      setUser(userData);

      // 로그인 성공 시 dataLayer에 이벤트 푸시
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "login",
          user_id: userData.id || userData.userId,
        });
      } catch (error) {
        console.warn("dataLayer 푸시 실패:", error);
      }
    } else {
      window.location.href = "/login";
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || null;

        
        // 서버에서 invalidate 플래그가 온 경우
        if (data.invalidate) {
          setUser(null);
          return null;
        }

        // 온보딩 중인 사용자인 경우
        if (data.pending || userData?.status === "PENDING") {
          setUser(null);
          return null;
        }

        setUser(userData);
        return userData;
      } else if (response.status === 401) {
        // Access token 만료, refresh 시도
        const refreshed = await refreshToken();
        if (!refreshed) {
          setUser(null);
          return null;
        }
        // refresh 성공 후 다시 시도
        return await refreshSession();
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setUser(null);
      return null;
    }
  }, [refreshToken]);

  const logout = useCallback(async () => {
    try {
      setUser(null);

      await fetch("/api/auth/token/revoke", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      toast.error("로그아웃 중 오류가 발생했습니다.");
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshSession,
    refreshToken,
    isAuthenticated: !!user,
    isPending: user?.status === "PENDING",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}