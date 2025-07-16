import React from "react";
import { Label } from "@/components/ui/label";

interface Option {
  value: string;
  label: string;
}

interface FilterBarProps {
  label: string;
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ label, options, selected, onSelect }) => {
  return (
    <div className="flex gap-4 w-max">
      <Label htmlFor="filter-select" className="text-lg">{label}</Label>
      <select
        id="filter-select"
        className="border rounded px-2 py-1"
        value={selected}
        onChange={e => onSelect(e.target.value)}
      >
        <option value="">Todas</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
};

export default FilterBar; 