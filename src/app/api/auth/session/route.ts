import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, getUserWithInterests } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Step 1: 쿠키에서 세션 확인 (기본 방식)
    let session = getSessionFromRequest(request);

    // Step 2: 쿠키 세션이 없는 경우 처리
    if (!session) {

      // 임시 세션 확인 (온보딩 중인 사용자)
      const pendingUser = request.cookies.get("pendingUser")?.value;
      if (pendingUser) {
        return NextResponse.json({ user: null, pending: true });
      }

      return NextResponse.json({ user: null });
    }

    // Step 3: 세션이 있는 경우, DB에서 최신 정보 확인 및 동기화
    try {
      const userId = parseInt(session.id);
      if (isNaN(userId)) {
        console.error("유효하지 않은 사용자 ID:", session.id);
        return NextResponse.json({ user: null });
      }

      // DB에서 최신 사용자 정보 가져오기 (성능 최적화: 필요시에만)
      const dbUser = await getUserWithInterests(userId);
      
      if (!dbUser) {
        console.error("DB에서 사용자를 찾을 수 없음:", userId);
        // 사용자가 삭제되었거나 존재하지 않는 경우 - 쿠키 무효화
        return NextResponse.json({ user: null, invalidate: true });
      }

      // DB 정보로 세션 정보 업데이트 (최신 정보 반영)
      const updatedSession = {
        id: dbUser.id.toString(),
        email: dbUser.email,
        nickname: dbUser.nickname,
        profileImage: dbUser.profileImage || undefined,
        provider: dbUser.provider as 'naver' | 'kakao',
        region: dbUser.region || undefined,
        ageGroup: dbUser.ageGroup || undefined,
        gender: (dbUser.gender as 'm' | 'f' | 'u' | undefined) || undefined,
        privacyAgreed: dbUser.privacyAgreed,
        marketingAgreed: dbUser.marketingAgreed || undefined,
        interests: dbUser.interests?.map((interest) => ({
          id: interest.id,
          categoryId: interest.categoryId,
          category: {
            id: interest.category.id,
            name: interest.category.name,
            slug: interest.category.slug,
            icon: interest.category.icon,
            description: interest.category.description || undefined,
          },
        })) || [],
      };


      // 세션 정보가 업데이트된 경우 클라이언트에 알림
      const needsUpdate = JSON.stringify(session) !== JSON.stringify(updatedSession);

      return NextResponse.json({ 
        user: updatedSession,
        updated: needsUpdate
      });
    } catch (dbError) {
      console.error("DB 동기화 실패:", dbError);
      // DB 오류가 발생해도 쿠키 세션은 유지 (오프라인 대응)
      return NextResponse.json({ user: session });
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null });
  }
}
