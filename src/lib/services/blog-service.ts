import xml2js from "xml2js";

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
  // Lambda를 통한 네이버 블로그 개별 포스트 크롤링
  static async fetchSingleBlogPost(postUrl: string): Promise<BlogPost | null> {
    try {
      const lambdaUrl = process.env.LAMBDA_CRAWLER_URL;
      if (!lambdaUrl) {
        throw new Error("LAMBDA_CRAWLER_URL environment variable is not set");
      }

      console.log("Calling Lambda crawler for:", postUrl);

      const response = await fetch(lambdaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blogUrl: postUrl }),
      });

      if (!response.ok) {
        console.error(
          `Lambda call failed: ${response.status} ${response.statusText}`
        );
        return null;
      }

      const result = await response.json();

      if (!result.success) {
        console.error("Lambda extraction failed:", result.error);
        return null;
      }

      const blogData = result.data;
      console.log("Lambda extraction successful:", {
        title: blogData.title?.substring(0, 50),
        contentLength: blogData.content?.length || 0,
        author: blogData.author,
      });

      return {
        title: blogData.title || "",
        link: postUrl,
        pubDate: blogData.pubDate || "",
        description:
          blogData.description || blogData.content?.substring(0, 1000) || "",
        author: blogData.author || "",
        category: blogData.category || "",
        tags: blogData.tags || [],
        images: blogData.images || [],
      };
    } catch (error) {
      console.error("Lambda blog crawling error:", error);
      return null;
    }
  }

  // 네이버 블로그 URL에서 RSS URL 생성 (기존 메소드 유지)
  static generateRssUrl(websiteUrl: string): string | null {
    const blogIdMatch = websiteUrl.match(/blog\.naver\.com\/([^\/\?#]+)/);
    if (!blogIdMatch) return null;
    return `https://rss.blog.naver.com/${blogIdMatch[1]}.xml`;
  }

  // RSS 피드에서 최신 포스트들 가져오기 (기존 메소드 유지)
  static async fetchBlogPosts(rssUrl: string): Promise<BlogPost[]> {
    try {
      const response = await fetch(rssUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
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
      return items.map((item: any) => {
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
          link: item.link[0] || "",
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
