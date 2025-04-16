
import React from "react";
import { Input } from "@/components/ui/input";

interface DomainSearchProps {
  onSearch?: (query: string) => void;
}

const DomainSearch: React.FC<DomainSearchProps> = ({ onSearch }) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <Input
          className="clay-input pl-10"
          placeholder="Search domains..."
          onChange={handleSearch}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DomainSearch;
