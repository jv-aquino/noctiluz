import React from "react";
import { Label } from "@/components/ui/label";

export interface MateriaOption {
  id: string;
  name: string;
}

interface RelatedMateriasEditorProps {
  materias: MateriaOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

const RelatedMateriasEditor: React.FC<RelatedMateriasEditorProps> = ({ materias, selected, onChange, disabled }) => {
  const toggleMateria = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(m => m !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Matérias Relacionadas</Label>
      <div className="flex flex-wrap gap-2">
        {materias.map(materia => (
          <label key={materia.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(materia.id)}
              onChange={() => toggleMateria(materia.id)}
              disabled={disabled}
              className="accent-pink-600"
            />
            <span className="text-sm">{materia.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RelatedMateriasEditor; 