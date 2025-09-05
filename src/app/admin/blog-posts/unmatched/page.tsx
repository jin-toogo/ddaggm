"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ExternalLink, CheckCircle } from 'lucide-react';

interface UnmatchedPost {
  id: string;
  title: string;
  clinicName?: string;
  clinicAddress?: string;
  originalUrl: string;
  createdAt: string;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  province: string;
  district: string;
  phone?: string;
}

export default function UnmatchedBlogPostsPage() {
  const [posts, setPosts] = useState<UnmatchedPost[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<UnmatchedPost | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    fetchUnmatchedPosts();
  }, []);

  const fetchUnmatchedPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts/unmatched');
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Error fetching unmatched posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchHospitals = async (query: string) => {
    if (!query.trim()) {
      setHospitals([]);
      return;
    }

    try {
      const response = await fetch(`/api/admin/hospitals/search?name=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (error) {
      console.error('Error searching hospitals:', error);
    }
  };

  const handleMatch = async () => {
    if (!selectedPost || !selectedHospital) return;

    setIsMatching(true);
    try {
      const response = await fetch(`/api/admin/blog-posts/${selectedPost.id}/match`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hospitalId: selectedHospital.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        // 매칭된 포스트를 목록에서 제거
        setPosts(posts.filter(p => p.id !== selectedPost.id));
        setSelectedPost(null);
        setSelectedHospital(null);
        setSearchQuery('');
        setHospitals([]);
      } else {
        alert('매칭 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Error matching post:', error);
      alert('매칭 중 오류가 발생했습니다.');
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedPost && selectedPost.clinicName) {
        searchHospitals(selectedPost.clinicName);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedPost]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchHospitals(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">매칭 대기 블로그 포스트</h1>
        <p className="text-muted-foreground">
          한의원과 매칭되지 않은 블로그 포스트들을 수동으로 매칭할 수 있습니다.
        </p>
      </div>

      {posts.length === 0 ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            모든 블로그 포스트가 매칭되었습니다!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 매칭 대기 포스트 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>매칭 대기 포스트 ({posts.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPost?.id === post.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">{post.title}</h4>
                    
                    {post.clinicName && (
                      <Badge variant="secondary" className="mb-1">
                        {post.clinicName}
                      </Badge>
                    )}
                    
                    {post.clinicAddress && (
                      <p className="text-xs text-muted-foreground mb-2">{post.clinicAddress}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a 
                          href={post.originalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          원본
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 한의원 검색 및 매칭 */}
          <Card>
            <CardHeader>
              <CardTitle>한의원 매칭</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPost ? (
                <>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">선택된 포스트:</h4>
                    <p className="text-sm">{selectedPost.title}</p>
                    {selectedPost.clinicName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        제공된 한의원명: {selectedPost.clinicName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalSearch">한의원 검색</Label>
                    <Input
                      id="hospitalSearch"
                      type="text"
                      placeholder="한의원명 또는 주소를 입력하세요"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {hospitals.length > 0 && (
                    <div className="space-y-2">
                      <Label>검색 결과:</Label>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {hospitals.map((hospital) => (
                          <div
                            key={hospital.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedHospital?.id === hospital.id 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedHospital(hospital)}
                          >
                            <h5 className="font-medium text-sm">{hospital.name}</h5>
                            <p className="text-xs text-muted-foreground">{hospital.address}</p>
                            <p className="text-xs text-muted-foreground">
                              {hospital.province} {hospital.district}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleMatch}
                    disabled={!selectedHospital || isMatching}
                    className="w-full flex items-center gap-2"
                  >
                    {isMatching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {isMatching ? '매칭 중...' : '매칭 실행'}
                  </Button>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>왼쪽에서 매칭할 블로그 포스트를 선택하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}