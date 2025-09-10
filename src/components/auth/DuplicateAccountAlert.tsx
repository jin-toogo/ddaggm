'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, User, ArrowRight } from 'lucide-react';
import { getProviderDisplayName, getProviderColor } from '@/lib/auth-utils';
import { toast } from 'sonner';

interface DuplicateAccount {
  provider: string;
  name: string;
  profileImage?: string | null;
}

interface DuplicateAccountAlertProps {
  accounts: DuplicateAccount[];
  currentProvider: string;
  onContinueAnyway: () => void;
  onUseExistingAccount: (provider: string) => void;
  className?: string;
}

export function DuplicateAccountAlert({
  accounts,
  currentProvider,
  onContinueAnyway,
  onUseExistingAccount,
  className = '',
}: DuplicateAccountAlertProps) {
  const currentProviderName = getProviderDisplayName(currentProvider);

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            이미 다른 방법으로 가입한 계정이 있습니다
          </h3>
          
          <div className="space-y-2 mb-4">
            {accounts.map((account, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 text-sm text-amber-700"
              >
                <User className="h-4 w-4" />
                <span className={`font-medium ${getProviderColor(account.provider)}`}>
                  {getProviderDisplayName(account.provider)}
                </span>
                <span>계정:</span>
                <span className="font-medium">{account.name}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-amber-700 mb-4">
            {currentProviderName}로 새 계정을 만들거나, 기존 계정으로 로그인하실 수 있습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info(`${currentProviderName} 새 계정을 생성합니다.`);
                onContinueAnyway();
              }}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {currentProviderName} 새 계정으로 계속하기
            </Button>
            
            {accounts.map((account, index) => (
              <Button
                key={index}
                variant="default"
                size="sm"
                onClick={() => {
                  toast.info(`기존 ${getProviderDisplayName(account.provider)} 계정으로 로그인합니다.`);
                  onUseExistingAccount(account.provider);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                {getProviderDisplayName(account.provider)}로 로그인하기
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}