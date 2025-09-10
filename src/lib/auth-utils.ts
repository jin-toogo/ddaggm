import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface DuplicateEmailResult {
  exists: boolean;
  accounts: Array<{
    provider: string;
    nickname: string;
    profileImage?: string | null;
  }>;
}

/**
 * 중복 이메일 계정을 확인합니다
 * @param email 확인할 이메일 주소
 * @param currentProvider 현재 로그인 시도 중인 provider (제외할 provider)
 * @returns 중복 계정 정보
 */
export async function checkDuplicateEmail(
  email: string, 
  currentProvider: string
): Promise<DuplicateEmailResult> {
  try {
    const existingUsers = await prisma.user.findMany({
      where: {
        email,
        provider: { not: currentProvider.toLowerCase() }
      },
      select: { 
        provider: true, 
        nickname: true, 
        profileImage: true 
      }
    });

    return {
      exists: existingUsers.length > 0,
      accounts: existingUsers.map(user => ({
        provider: user.provider,
        nickname: user.nickname,
        profileImage: user.profileImage
      }))
    };
  } catch (error) {
    console.error('중복 이메일 확인 오류:', error);
    return { exists: false, accounts: [] };
  }
}

/**
 * Provider 이름을 한글로 변환합니다
 * @param provider provider 이름 (naver, kakao)
 * @returns 한글 provider 이름
 */
export function getProviderDisplayName(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'naver':
      return '네이버';
    case 'kakao':
      return '카카오';
    default:
      return provider;
  }
}

/**
 * Provider 색상을 반환합니다
 * @param provider provider 이름 (naver, kakao)  
 * @returns CSS 색상 클래스
 */
export function getProviderColor(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'naver':
      return 'text-green-600';
    case 'kakao':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}