"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
}

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStepId: string;
  className?: string;
}

export function OnboardingProgress({
  steps,
  currentStepId,
  className,
}: OnboardingProgressProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressValue = (completedSteps / steps.length) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 전체 진행률 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">
            계정 설정 진행률
          </h3>
          <span className="text-xs text-gray-500">
            {completedSteps}/{steps.length} 완료
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* 단계별 목록 */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isCompleted = step.completed;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div key={step.id} className="flex items-center space-x-3">
              {/* 상태 아이콘 */}
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isCurrent ? (
                <div className="h-5 w-5 border-2 border-blue-500 rounded-full bg-blue-50 flex items-center justify-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                </div>
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}

              {/* 단계 제목 */}
              <span
                className={`text-sm ${
                  isCompleted
                    ? "text-green-600 font-medium"
                    : isCurrent
                    ? "text-blue-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* 완료 메시지 */}
      {completedSteps === steps.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700 font-medium">
              계정 설정이 완료되었습니다!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
