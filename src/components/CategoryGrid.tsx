"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Baby,
  Vegan,
  Sparkles,
  Pill,
  Droplets,
  Users,
  UserCheck,
  FlowerIcon,
  FileText,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  clinicCount: number;
}

const categoryIcons: { [key: string]: any } = {
  pregnancy: Baby,
  diet: Vegan,
  beauty: Sparkles,
  pain: Pill,
  skin: Droplets,
  fertility: Users,
  pediatric: UserCheck,
  menopause: FlowerIcon,
};

const categorySimpleNames: { [key: string]: string } = {
  pregnancy: "임신/산후",
  diet: "다이어트",
  beauty: "피부미용",
  menopause: "여성질환(생리통/갱년기)",
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/");
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const allCategories = [
    ...categories.map((cat) => ({
      ...cat,
      Icon: categoryIcons[cat.slug] || FileText,
      displayName: categorySimpleNames[cat.slug] || cat.name,
    })),
  ];

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full py-12 px-6 bg-white">
        <div className="">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-[1000px] mx-auto w-full pb-12">
      <div className="">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          관심있는 항목을 선택해보세요.
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {allCategories.map((category, index) => {
            return (
              <Link
                key={`${category.slug}-${index}`}
                href={
                  category.clinicCount > 0
                    ? `/categories/${category.slug}`
                    : "#"
                }
                className={`w-full flex justify-center group transition-all duration-200  ${
                  category.clinicCount > 0 ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="w-fit flex flex-col items-center space-y-2 transition-all bg-gray-100/0 group-hover:bg-gray-100/100 rounded-md px-6 py-4">
                  <category.Icon className="w-10 h-10 text-gray-700  transition-all" />
                  <span className="text-sm text-black text-center  group-hover:font-bold transition-all">
                    {category.displayName}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
