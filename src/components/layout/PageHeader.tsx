"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="w-full py-4 border-b border-gray-200 max-w-4xl text-center">
      <h1 className="text-xl font-semibold text-gray-900 ">{title}</h1>
    </div>
  );
}
