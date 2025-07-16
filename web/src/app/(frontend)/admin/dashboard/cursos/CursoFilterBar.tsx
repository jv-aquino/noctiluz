import React from "react";
import FilterBar from "@/components/table/FilterBar";
import SearchBar from "@/components/table/SearchBar";

interface Materia {
  id: string;
  name: string;
}

interface CursoFilterBarProps {
  materias: Materia[];
  selectedMateria: string;
  onMateriaChange: (id: string) => void;
  search: string;
  onSearch: (s: string) => void;
}

const CursoFilterBar: React.FC<CursoFilterBarProps> = ({ materias, selectedMateria, onMateriaChange, search, onSearch }) => {
  return (
    <div className="flex flex-col gap-4 justify-center">
      <FilterBar
        label="Filtrar por Matéria:"
        options={materias.map(m => ({ value: m.id, label: m.name }))}
        selected={selectedMateria}
        onSelect={onMateriaChange}
      />
      <SearchBar
        value={search}
        onChange={onSearch}
        placeholder="Pesquisar Curso"
      />
    </div>
  );
};

export default CursoFilterBar; 