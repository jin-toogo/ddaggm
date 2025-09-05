"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ProcessResult {
  totalRows: number;
  processed: number;
  matched: number;
  unmatchedCount: number;
  errors: string[];
}

export default function AdminBlogPostsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('CSV 파일만 업로드 가능합니다.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/blog-posts/import-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'CSV 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = `네이버 블로그 링크,한의원명(있으면),한의원 주소,비고
https://blog.naver.com/example1/123,이병삼경희한의원,서울시 강남구,
https://blog.naver.com/example2/456,대추밭백한의원,경기도 용인시,
https://blog.naver.com/example3/789,,,한의원 정보 없음`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_blog_posts.csv';
    link.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">블로그 리뷰 관리</h1>
        <p className="text-muted-foreground">
          CSV 파일로 네이버 블로그 리뷰를 일괄 업로드하고 한의원과 매칭합니다.
        </p>
      </div>

      {/* CSV 업로드 섹션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV 파일 업로드
          </CardTitle>
          <CardDescription>
            블로그 URL, 한의원명, 주소, 비고가 포함된 CSV 파일을 업로드하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">CSV 파일 선택</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isProcessing ? '처리 중...' : 'CSV 업로드'}
            </Button>

            <Button
              variant="outline"
              onClick={downloadSampleCsv}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              샘플 CSV 다운로드
            </Button>
          </div>

          {/* 선택된 파일 정보 */}
          {file && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>선택된 파일:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 에러 표시 */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 처리 결과 */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              처리 완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">전체 행</p>
                <p className="text-2xl font-bold text-blue-900">{result.totalRows}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">처리 완료</p>
                <p className="text-2xl font-bold text-green-900">{result.processed}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">매칭 성공</p>
                <p className="text-2xl font-bold text-purple-900">{result.matched}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">매칭 대기</p>
                <p className="text-2xl font-bold text-orange-900">{result.unmatchedCount}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">처리 오류:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button asChild>
                <a href="/admin/blog-posts/unmatched">
                  매칭 대기 목록 보기
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/reviews">
                  사용자 리뷰 페이지 보기
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV 형식 안내 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSV 파일 형식</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">필수 헤더 (첫 번째 행):</p>
            <code className="block p-2 bg-muted rounded text-sm">
              네이버 블로그 링크,한의원명(있으면),한의원 주소,비고
            </code>
            
            <p className="text-sm font-medium mt-4">예시 데이터:</p>
            <code className="block p-2 bg-muted rounded text-sm">
              https://blog.naver.com/example/123,이병삼경희한의원,서울시 강남구,<br />
              https://blog.naver.com/example/456,,,한의원 정보 없음
            </code>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>네이버 블로그 링크</strong>: 네이버 블로그 포스트 URL (필수)</li>
                <li><strong>한의원명(있으면)</strong>: 한의원명 (선택사항)</li>
                <li><strong>한의원 주소</strong>: 한의원 주소 (선택사항)</li>
                <li><strong>비고</strong>: 비고사항 (선택사항)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}