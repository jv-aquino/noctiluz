import React from "react";
import { Label } from "@/components/ui/label";

export interface SubjectOption {
  id: string;
  name: string;
}

interface RelatedSubjectsEditorProps {
  subjects: SubjectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

const RelatedSubjectsEditor: React.FC<RelatedSubjectsEditorProps> = ({ subjects, selected, onChange, disabled }) => {
  const toggleSubject = (id: string) => {
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
        {subjects.map(subject => (
          <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(subject.id)}
              onChange={() => toggleSubject(subject.id)}
              disabled={disabled}
              className="accent-pink-600 peer"
            />
            <span className="text-sm peer-checked:text-pink-500">{subject.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RelatedSubjectsEditor;