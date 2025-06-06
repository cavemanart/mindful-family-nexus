
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KeywordSearchProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  placeholder?: string;
}

const KeywordSearch: React.FC<KeywordSearchProps> = ({
  searchKeyword,
  onSearchChange,
  placeholder = "Search events..."
}) => {
  return (
    <div className="relative flex items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
        />
        {searchKeyword && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default KeywordSearch;
