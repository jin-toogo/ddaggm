"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button 
      onClick={handleBack}
      className="p-2 hover:bg-gray-100 rounded-full"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}