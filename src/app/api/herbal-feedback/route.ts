import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "피드백 내용이 필요합니다" },
        { status: 400 }
      );
    }

    // 클라이언트 정보 수집
    const userAgent = request.headers.get("user-agent") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "unknown";

    const feedback = await prisma.herbalFeedback.create({
      data: {
        content: content.trim(),
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({
      message: "피드백이 성공적으로 저장되었습니다",
      id: feedback.id,
    });
  } catch (error) {
    console.error("피드백 저장 에러:", error);
    return NextResponse.json(
      { error: "피드백 저장에 실패했습니다" },
      { status: 500 }
    );
  }
}
