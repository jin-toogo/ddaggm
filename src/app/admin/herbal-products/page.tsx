"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Upload,
  CheckCircle,
  XCircle,
  FileText,
  Plus,
} from "lucide-react";

interface ImportResult {
  imported: number;
  total: number;
  message: string;
}

export default function HerbalProductsAdminPage() {
  // CSV 업로드 상태
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 개별 제품 추가 상태
  const [singleProduct, setSingleProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    brand: "",
    url: "",
    imageUrl: "",
  });
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<string | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("CSV 파일만 업로드 가능합니다.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("파일을 선택해주세요.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/herbal-products/import-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // 업로드 성공 후 파일 선택을 초기화 (옵션)
        setFile(null);
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || "CSV 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
      console.error("Upload error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleProductSubmit = async () => {
    if (!singleProduct.name.trim()) {
      setSingleError("제품명을 입력해주세요.");
      return;
    }

    if (!singleProduct.url.trim()) {
      setSingleError("구매 링크를 입력해주세요.");
      return;
    }

    setIsSubmittingSingle(true);
    setSingleError(null);
    setSingleResult(null);

    try {
      const response = await fetch("/api/herbal-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: singleProduct.name,
          category: singleProduct.category || "기타",
          description: singleProduct.description || `${singleProduct.name} 제품입니다.`,
          price: singleProduct.price,
          brand: singleProduct.brand,
          url: singleProduct.url,
          imageUrl: singleProduct.imageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSingleResult("제품이 성공적으로 추가되었습니다.");
        setSingleProduct({
          name: "",
          category: "",
          description: "",
          price: "",
          brand: "",
          url: "",
          imageUrl: "",
        });
      } else {
        setSingleError(
          data.error || "제품 추가 중 오류가 발생했습니다."
        );
      }
    } catch (err) {
      setSingleError("네트워크 오류가 발생했습니다.");
      console.error("Single product submit error:", err);
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = `가격,링크,이미지,이름,카테고리,판매처
93100,https://itempage3.auction.co.kr/DetailView.aspx?itemno=D586999524,https://image.auction.co.kr/itemimage/38/63/2e/38632e32f6.jpg,웅진 다릴한 후 한방 갱년기 건강 80ml 30포,여성질환,옥션
45000,https://www.coupang.com/vp/products/8583199261,https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/17ac/5e7288ae6adf39f0b187b461bcba7f859d3136076698f32fa9d6512a0d94.jpg,요통 허리통증 갱년기예방 요슬케어한방비책 200g 2개,여성질환,쿠팡`;

    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_herbal_products.csv";
    link.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">한방건기식 제품 관리</h1>
        <p className="text-muted-foreground">
          한방건기식 제품을 개별 또는 CSV 파일로 업로드하여 관리합니다.
        </p>
      </div>

      {/* 개별 제품 추가 섹션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            제품 개별 추가
          </CardTitle>
          <CardDescription>
            제품 정보를 직접 입력하여 개별적으로 추가합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">제품명 *</Label>
              <Input
                id="productName"
                placeholder="예: 웅진 다릴한 후 한방 갱년기 건강"
                value={singleProduct.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSingleProduct((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isSubmittingSingle}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                placeholder="예: 여성건강, 수면개선, 면역개선 등"
                value={singleProduct.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSingleProduct((prev) => ({ ...prev, category: e.target.value }))
                }
                disabled={isSubmittingSingle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">가격</Label>
              <Input
                id="price"
                placeholder="예: 93,100원"
                value={singleProduct.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSingleProduct((prev) => ({ ...prev, price: e.target.value }))
                }
                disabled={isSubmittingSingle}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">판매처</Label>
              <Input
                id="brand"
                placeholder="예: 옥션, 쿠팡, 네이버"
                value={singleProduct.brand}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSingleProduct((prev) => ({ ...prev, brand: e.target.value }))
                }
                disabled={isSubmittingSingle}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productUrl">구매 링크 *</Label>
            <Input
              id="productUrl"
              type="url"
              placeholder="https://example.com/product"
              value={singleProduct.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSingleProduct((prev) => ({ ...prev, url: e.target.value }))
              }
              disabled={isSubmittingSingle}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">이미지 URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={singleProduct.imageUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSingleProduct((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              disabled={isSubmittingSingle}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">제품 설명</Label>
            <Textarea
              id="description"
              placeholder="제품에 대한 간단한 설명을 입력하세요..."
              value={singleProduct.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setSingleProduct((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isSubmittingSingle}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSingleProductSubmit}
            disabled={!singleProduct.name.trim() || !singleProduct.url.trim() || isSubmittingSingle}
            className="flex items-center gap-2"
          >
            {isSubmittingSingle ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isSubmittingSingle ? "추가 중..." : "제품 추가"}
          </Button>

          {/* 개별 추가 에러 */}
          {singleError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{singleError}</AlertDescription>
            </Alert>
          )}

          {/* 개별 추가 성공 */}
          {singleResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                {singleResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* CSV 업로드 섹션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV 파일 업로드
          </CardTitle>
          <CardDescription>
            제품 정보가 담긴 CSV 파일을 업로드하세요.
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
              {isProcessing ? "처리 중..." : "CSV 업로드"}
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
                <strong>선택된 파일:</strong> {file.name} (
                {(file.size / 1024).toFixed(1)} KB)
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              처리 완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">전체 행</p>
                <p className="text-2xl font-bold text-blue-900">
                  {result.total}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">성공적으로 가져옴</p>
                <p className="text-2xl font-bold text-green-900">
                  {result.imported}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{result.message}</p>

            <div className="flex gap-2">
              <Button asChild>
                <a href="/herbal-supplements">제품 페이지 보기</a>
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
              가격,링크,이미지,이름,카테고리,판매처
            </code>

            <p className="text-sm font-medium mt-4">예시 데이터:</p>
            <code className="block p-2 bg-muted rounded text-sm">
              93100,https://itempage3.auction.co.kr/DetailView.aspx?itemno=D586999524,https://image.auction.co.kr/itemimage/38/63/2e/38632e32f6.jpg,웅진 다릴한 후 한방 갱년기 건강 80ml 30포,여성질환,옥션
            </code>

            <div className="mt-4 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>가격</strong>: 숫자만 입력 (예: 93100)</li>
                <li><strong>링크</strong>: 제품 구매 링크 (필수)</li>
                <li><strong>이미지</strong>: 제품 이미지 URL</li>
                <li><strong>이름</strong>: 제품명 (필수)</li>
                <li><strong>카테고리</strong>: 제품 카테고리</li>
                <li><strong>판매처</strong>: 옥션, 쿠팡, 네이버 등</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">카테고리 자동 매핑</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 여성질환 → 여성건강</p>
                <p>• 수면 → 수면개선</p>
                <p>• 면역력 → 면역개선</p>
                <p>• 혈당조절 → 혈당관리</p>
                <p>• 소화질환 → 소화개선</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}