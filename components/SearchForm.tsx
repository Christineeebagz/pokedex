"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";

interface SearchFormProps {
  query?: string;
  onSearch: (query: string) => void;
}

const SearchForm = ({ query = "", onSearch }: SearchFormProps) => {
  const [inputValue, setInputValue] = useState(query);
  const router = useRouter();
  const pathname = usePathname();

  // Sync local state with external query changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    // Update URL without page reload
    const params = new URLSearchParams();
    if (inputValue) params.set("query", inputValue);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-auto flex bg-white border-[3px] border-[rgba(59,76,202,0.5)] rounded-[10px] p-1"
    >
      <Search className="size-5 h-auto mx-3 text-[#3B4CCA]" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full p-1 h-auto outline-none flex-1 font-bold text-[#3B4CCA] placeholder:font-semibold placeholder:text-[rgba(59,76,202,0.5)]"
        placeholder="Search for No. ID or Name"
      />
    </form>
  );
};

export default SearchForm;

// import Form from "next/form";
// import { Search } from "lucide-react";

// const SearchForm = ({ query }: { query?: string }) => {
//   return (
//     <Form
//       action="/"
//       scroll={false}
//       className=" w-full  h-auto flex bg-white border-[3px] border-[rgba(59,76,202,0.5)] rounded-[10px] p-1"
//     >
//       <Search className="size-5 h-auto mx-3" />
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => onSearch(e.target.value)}
//         className="w-full p-1 h-auto outline-none flex-1 font-bold text-[#3B4CCA] placeholder:font-semibold placeholder:text-[rgba(59,76,202,0.5)]"
//         placeholder="Search for No. ID or Name"
//       />
//     </Form>
//   );
// };

// export default SearchForm;
