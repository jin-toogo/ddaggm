import { BlogService, type BlogPost as RssBlogPost } from "./blog-service";
import prisma from "@/lib/prisma";
import { findHospitalId } from "@/lib/utils/clinic-matching";
import {
  type BlogCsvRow,
  type BlogPostData,
  extractCategories,
  extractTags,
} from "@/lib/utils/csv-parser";

export class BlogReviewService {
  /**
   * CSV 데이터를 처리하여 블로그 포스트들을 DB에 저장
   */
  static async processCsvData(csvRows: BlogCsvRow[]): Promise<{
    processed: number;
    matched: number;
    errors: string[];
  }> {
    let processed = 0;
    let matched = 0;
    const errors: string[] = [];

    for (const row of csvRows) {
      try {
        await this.processSingleBlogUrl(row);
        processed++;

        // 매칭 성공 여부 확인
        if (row.clinic_name && row.clinic_address) {
          const hospitalId = await findHospitalId(
            row.clinic_name,
            row.clinic_address,
            prisma
          );
          if (hospitalId) matched++;
        }
      } catch (error) {
        const errorMessage = `URL: ${row.blog_url} - ${
          (error as Error).message
        }`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    return { processed, matched, errors };
  }

  /**
   * 개별 블로그 URL 처리
   */
  static async processSingleBlogUrl(row: BlogCsvRow): Promise<void> {
    // 개별 포스트 직접 크롤링
    const blogPost = await BlogService.fetchSingleBlogPost(row.blog_url);
    if (!blogPost) {
      throw new Error("블로그 포스트를 크롤링할 수 없습니다.");
    }

    // 중복 체크
    const existingPost = await prisma.blogPost.findUnique({
      where: { originalUrl: blogPost.link },
    });

    if (existingPost) {
      console.log(`이미 존재하는 포스트: ${blogPost.link}`);
      return;
    }

    // 한의원 매칭 시도
    let hospitalId: number | null = null;
    if (row.clinic_name && row.clinic_address) {
      hospitalId = await findHospitalId(
        row.clinic_name,
        row.clinic_address,
        prisma
      );
    }
    // HTML 태그 제거하여 순수 텍스트 추출
    console.log(
      "Raw blogPost.description:",
      blogPost.description?.substring(0, 200)
    );
    const cleanContent = this.cleanHtmlContent(blogPost.description || "");
    console.log("Clean content:", cleanContent.substring(0, 200));
    const summary = cleanContent.substring(0, 300);
    console.log("Summary:", summary);

    // 카테고리 및 태그 추출
    const categories = row.category 
      ? [row.category] 
      : extractCategories(cleanContent, blogPost.title);
    const tags = [...extractTags(cleanContent), ...(blogPost.tags || [])];

    // BlogPost 생성
    await prisma.blogPost.create({
      data: {
        title: blogPost.title,
        content: cleanContent,
        summary,
        imageUrl: blogPost.images?.[0] || null,
        originalUrl: blogPost.link,
        publishedAt: blogPost.pubDate ? new Date(blogPost.pubDate) : new Date(),
        author: blogPost.author || "Unknown",
        clinicName: row.clinic_name || null,
        clinicAddress: row.clinic_address || null,
        hospitalId: hospitalId,
        notes: row.notes || null,
        isMatched: !!hospitalId,
        categories: categories.join(","),
        tags: tags
          .filter((tag, index) => tags.indexOf(tag) === index)
          .join(","), // 중복 제거
        isVerified: false,
      },
    });

    console.log(
      `블로그 포스트 저장 완료: ${blogPost.title} (매칭: ${!!hospitalId})`
    );
  }

  /**
   * HTML 태그 제거하여 순수 텍스트 추출
   */
  static cleanHtmlContent(html: string): string {
    return html
      .replace(/<[^>]*>/g, "") // HTML 태그 제거
      .replace(/&nbsp;/g, " ") // &nbsp; 변환
      .replace(/&lt;/g, "<") // HTML 엔티티 변환
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ") // 여러 공백을 하나로
      .trim();
  }

  /**
   * 매칭되지 않은 블로그 포스트들 조회
   */
  static async getUnmatchedPosts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isMatched: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          clinicName: true,
          clinicAddress: true,
          originalUrl: true,
          createdAt: true,
        },
      }),
      prisma.blogPost.count({
        where: { isMatched: false },
      }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 블로그 포스트 목록 조회 (사용자용)
   */
  static async getBlogPosts(
    page = 1,
    limit = 20,
    filters: {
      clinicName?: string;
      category?: string;
      search?: string;
    } = {}
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.clinicName) {
      where.clinicName = { contains: filters.clinicName };
    }

    if (filters.category) {
      where.categories = { contains: filters.category };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { content: { contains: filters.search } },
        { clinicName: { contains: filters.search } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
              address: true,
              province: true,
              district: true,
            },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      posts: posts.map((post) => ({
        ...post,
        categories: post.categories.split(",").filter(Boolean),
        tags: post.tags.split(",").filter(Boolean),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 수동으로 블로그 포스트와 한의원 매칭
   */
  static async matchBlogPostToHospital(
    postId: string,
    hospitalId: number
  ): Promise<void> {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        hospitalId,
        isMatched: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 블로그 포스트 검증 상태 변경
   */
  static async verifyBlogPost(
    postId: string,
    verified: boolean
  ): Promise<void> {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        isVerified: verified,
        updatedAt: new Date(),
      },
    });
  }
}
