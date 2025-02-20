import { useState } from "react";

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: any) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="flex items-center border border-gray-600 bg-gray-800 rounded-full shadow-md">
          <input
            id="default-search"
            className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none p-2 pl-4 rounded-l-full"
            placeholder="Search..."
            required
            value={query}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </div>
  );
};
