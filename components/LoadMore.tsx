"use client";

import { Button } from "@headlessui/react";
// import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { ArrowDown } from "lucide-react";

interface LoadMoreProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

const LoadMore = ({ onClick, isLoading, hasMore = true }: LoadMoreProps) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <Button
        onClick={onClick}
        disabled={isLoading}
        className="box-border bg-[rgba(59,76,202,0.5)] border-[5px] border-[#3B4CCA] rounded-[25px] px-8 py-4 text-white font-bold text-lg hover:bg-[#FFDE00] hover:border-[#FFDE00] hover:text-[#3B4CCA] transition-colors duration-300 focus:outline-none"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <ArrowDown className="h-6 w-6 animate-spin" />
            Loading...
          </div>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
};

export default LoadMore;
