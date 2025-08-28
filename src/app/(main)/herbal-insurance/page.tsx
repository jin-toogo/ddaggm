import React, { Suspense } from "react";
import { HerbalInsurance } from "@/components/herbalInsurance";
import { StructuredData } from "@/components/StructuredData";

export default function Home() {
  return (
    <div>
      <StructuredData type="website" />
      <StructuredData type="medical-business" />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">데이터를 불러오는 중...</p>
            </div>
          </div>
        }
      >
        <HerbalInsurance />
      </Suspense>
    </div>
  );
}
