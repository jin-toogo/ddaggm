"use client";

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PrivacyAgreementProps {
  onAgreed: (privacy: boolean, marketing: boolean) => void;
  className?: string;
}

export function PrivacyAgreement({ onAgreed, className }: PrivacyAgreementProps) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const handleSubmit = () => {
    if (privacyAgreed) {
      onAgreed(privacyAgreed, marketingAgreed);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">
        개인정보 처리 동의
      </h3>
      
      <div className="space-y-3">
        {/* 필수 동의 */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="privacy-required"
            checked={privacyAgreed}
            onCheckedChange={(checked) => setPrivacyAgreed(checked === true)}
            className="mt-1"
          />
          <div className="flex-1">
            <label 
              htmlFor="privacy-required"
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              <span className="text-red-500">*</span> 개인정보 수집 및 이용 동의 (필수)
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                이름, 이메일, 프로필 이미지, 선택한 관심사
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                    자세히 보기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>개인정보 처리방침</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm text-gray-700">
                    <div>
                      <h4 className="font-semibold mb-2">1. 수집하는 개인정보 항목</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>필수항목: 이름, 이메일, 소셜로그인 정보</li>
                        <li>선택항목: 프로필 이미지, 관심 의료분야, 선호 지역</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2. 개인정보의 수집 및 이용목적</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>회원 가입 및 관리</li>
                        <li>맞춤형 한의원 추천 서비스 제공</li>
                        <li>서비스 개선 및 통계 분석</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3. 개인정보의 보유 및 이용기간</h4>
                      <p>회원 탈퇴 시까지 (단, 관련 법령에 따라 보존 의무가 있는 경우 해당 기간까지)</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">4. 개인정보 제공 거부권</h4>
                      <p>개인정보 수집에 대한 동의를 거부할 수 있으나, 서비스 이용이 제한될 수 있습니다.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* 선택 동의 */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="marketing-optional"
            checked={marketingAgreed}
            onCheckedChange={(checked) => setMarketingAgreed(checked === true)}
            className="mt-1"
          />
          <div className="flex-1">
            <label 
              htmlFor="marketing-optional"
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              마케팅 및 광고 수신 동의 (선택)
            </label>
            <p className="text-xs text-gray-500 mt-1">
              새로운 한의원 정보, 이벤트, 건강 정보 등을 이메일로 받아보시겠습니까?
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={!privacyAgreed}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          동의하고 계속하기
        </Button>
      </div>
    </div>
  );
}