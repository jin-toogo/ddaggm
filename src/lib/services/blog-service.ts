import xml2js from "xml2js";
import prisma from "@/lib/prisma";

export interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  author?: string;
  category?: string;
  tags?: string[];
  images?: string[];
}

export class BlogService {
  // 네이버 블로그 URL에서 RSS URL 생성
  static generateRssUrl(websiteUrl: string): string | null {
    const blogIdMatch = websiteUrl.match(/blog\.naver\.com\/([^\/\?#]+)/);
    if (!blogIdMatch) return null;
    return `https://rss.blog.naver.com/${blogIdMatch[1]}.xml`;
  }

  // RSS 피드에서 최신 포스트들 가져오기 (실시간)
  static async fetchBlogPosts(rssUrl: string): Promise<BlogPost[]> {
    try {
      const response = await fetch(rssUrl, {
        next: { revalidate: 10800 }, // 3시간 캐싱
      });

      if (!response.ok) {
        console.error(
          `RSS fetch failed: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const xmlData = await response.text();
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xmlData);

      const items = result.rss?.channel?.[0]?.item || [];
      return items.slice(0, 5).map((item: any) => {
        const description = item.description?.[0] || "";
        const tags = item.tag?.[0]
          ? item.tag[0].split(",").map((tag: string) => tag.trim())
          : [];

        // description에서 이미지 URL 추출
        const imageMatches =
          description.match(/<img[^>]*src="([^"]*)"[^>]*>/g) || [];
        const images = imageMatches
          .map((match: string) => {
            const srcMatch = match.match(/src="([^"]*)"/);
            return srcMatch ? srcMatch[1] : "";
          })
          .filter(Boolean);

        return {
          title: item.title?.[0] || "",
          link: item.link?.[0] || "",
          pubDate: item.pubDate?.[0] || "",
          description,
          author: item.author?.[0] || "",
          category: item.category?.[0] || "",
          tags,
          images,
        };
      });
    } catch (error) {
      console.error("RSS fetch error:", error);
      return [];
    }
  }

  // // 병원 블로그 피드 생성/업데이트
  // static async createBlogFeed(hospitalId: number, websiteUrl: string) {
  //   const rssUrl = this.generateRssUrl(websiteUrl);
  //   if (!rssUrl) throw new Error("Invalid Naver blog URL");

  //   return await prisma.blogFeed.upsert({
  //     where: { hospitalId },
  //     update: { rssUrl },
  //     create: { hospitalId, rssUrl },
  //   });
  // }

  // // 병원의 블로그 포스트 가져오기
  // static async getHospitalBlogPosts(hospitalId: number): Promise<BlogPost[]> {
  //   const blogFeed = await prisma.blogFeed.findUnique({
  //     where: { hospitalId, isActive: true },
  //   });

  //   if (!blogFeed) return [];
  //   return await this.fetchBlogPosts(blogFeed.rssUrl);
  // }

  // // 네이버 블로그 URL인지 확인
  // static isNaverBlog(url: string): boolean {
  //   const naverBlogPatterns = [
  //     /blog\.naver\.com\/([^\/]+)/,
  //     /m\.blog\.naver\.com\/([^\/]+)/,
  //     /.*\.blog\.me/,
  //   ];
  //   return naverBlogPatterns.some((pattern) => pattern.test(url));
  // }

  // 병원의 웹사이트가 네이버 블로그인지 확인하고 피드 생성
  // static async setupHospitalBlogFeed(hospitalId: number, websiteUrl: string) {
  //   if (!this.isNaverBlog(websiteUrl)) {
  //     throw new Error("Not a Naver blog URL");
  //   }

  //   return await this.createBlogFeed(hospitalId, websiteUrl);
  // }
}
