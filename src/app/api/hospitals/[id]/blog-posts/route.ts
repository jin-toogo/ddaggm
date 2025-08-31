import { BlogService } from "@/lib/services/blog-service";
import prisma from "@/lib/prisma";
import { extractNaverBlogId, getBlogRssUrl } from "@/lib/blog-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospitalId = parseInt(id);

    if (isNaN(hospitalId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid hospital ID",
        },
        { status: 400 }
      );
    }

    // hospital에서 naver_blog_url 가져오기
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { naverBlogUrl: true },
    });

    if (!hospital?.naverBlogUrl) {
      return Response.json({
        success: true,
        data: [],
      });
    }

    // 네이버 블로그 URL에서 블로그 ID 추출
    const blogId = extractNaverBlogId(hospital.naverBlogUrl);
    if (!blogId) {
      return Response.json({
        success: true,
        data: [],
      });
    }

    // RSS URL 생성 및 블로그 포스트 가져오기
    const rssUrl = getBlogRssUrl(blogId);
    const posts = await BlogService.fetchBlogPosts(rssUrl);

    return Response.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Blog posts API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
