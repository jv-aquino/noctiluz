import React from "react";
import FilterBar from "@/components/table/FilterBar";
import SearchBar from "@/components/table/SearchBar";

interface Subject {
  id: string;
  name: string;
}

interface CourseFilterBarProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (id: string) => void;
  search: string;
  onSearch: (s: string) => void;
}

const CourseFilterBar: React.FC<CourseFilterBarProps> = ({ subjects, selectedSubject, onSubjectChange, search, onSearch }) => {
  return (
    <div className="flex flex-col gap-4 justify-center">
      <FilterBar
        label="Filtrar por Matéria:"
        options={subjects.map(m => ({ value: m.id, label: m.name }))}
        selected={selectedSubject}
        onSelect={onSubjectChange}
      />
      <SearchBar
        value={search}
        onChange={onSearch}
        placeholder="Pesquisar Curso"
      />
    </div>
  );
};

export default CourseFilterBar; 