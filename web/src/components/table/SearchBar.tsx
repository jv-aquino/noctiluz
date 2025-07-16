import React from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <Input
      className="w-64"
      placeholder={placeholder || "Pesquisar"}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default SearchBar; 