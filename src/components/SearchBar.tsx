import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchExamples } from "@/lib/clinics";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };
  const handleExampleClick = (example: string) => {
    setSearchQuery(example);
    onSearch(example);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 w-full">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="한의원명을 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="h-12 px-6" disabled={isLoading}>
            {isLoading ? "검색 중..." : "검색"}
          </Button>
        </div>
      </form>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground mr-2">예시:</span>
        {searchExamples.map((example) => (
          <button
            key={example}
            onClick={() => handleExampleClick(example)}
            className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full hover:bg-accent transition-colors"
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
