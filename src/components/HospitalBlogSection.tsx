"use client";

import { useEffect, useState } from "react";
import { BookOpen, ExternalLink } from "lucide-react";

interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  author?: string;
  category?: string;
  tags?: string[];
  images?: string[];
}

interface Props {
  hospitalId: number;
}

export function HospitalBlogSection({ hospitalId }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    fetch(`/api/hospitals/${hospitalId}/blog-posts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPosts(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [hospitalId]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">블로그 소식</h2>
      </div>

      <div className="space-y-4">
        {posts.slice(0, visibleCount).map((post, index) => (
          <a
            key={index}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group border-t border-gray-200 pt-5 first:border-0"
          >
            <div className="flex gap-5">
              {post.images && post.images.length > 0 && (
                <div className="flex-shrink-0">
                  <img
                    src={`/api/proxy/image?url=${encodeURIComponent(
                      post.images[0]
                    )}`}
                    alt={post.title}
                    className="w-40 h-40 object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {post.description
                          .replace(/<[^>]*>/g, "")
                          .substring(0, 120)}
                        ...
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        {new Date(post.pubDate).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    {/* {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )} */}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {visibleCount < posts.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            더보기
          </button>
        </div>
      )}
    </div>
  );
}
