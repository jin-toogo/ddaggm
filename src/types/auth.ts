export interface TemporaryUserSession {
  provider: 'kakao' | 'naver';
  providerId: string;
  email: string;
  nickname: string;
  profileImage?: string;
  ageGroup?: string;
  gender?: 'm' | 'f';
  timestamp: number; // for expiration check
}

export interface CompleteRegistrationRequest {
  nickname: string;
  ageGroup?: string;
  gender?: 'm' | 'f';
  privacyAgreed: boolean;
  marketingAgreed?: boolean;
  categoryIds: number[];
}