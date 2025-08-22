import React, { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeContent } from "@/components/HomeContent";
import { StructuredData } from "@/components/StructuredData";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StructuredData type="website" />
      <StructuredData type="medical-business" />
      <Header />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">데이터를 불러오는 중...</p>
            </div>
          </main>
        }
      >
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  );
}