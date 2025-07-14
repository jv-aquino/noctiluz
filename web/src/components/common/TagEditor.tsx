import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  loading?: boolean;
}

const TagEditor = ({ tags, onChange, loading = false }: TagEditorProps) => {
  const [input, setInput] = useState("");
  const handleAdd = () => {
    const value = input.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
      setInput("");
    }
  };
  const handleRemove = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {tags.map(tag => (
        <span key={tag} className="bg-pink-100 text-pink-800 rounded px-2 py-0.5 flex items-center gap-1 text-xs">
          {tag}
          <button type="button" onClick={() => handleRemove(tag)} disabled={loading} className="ml-1">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <Input
        className="border rounded px-1 py-0.5 text-xs w-20"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
        disabled={loading}
        placeholder="+ tag"
      />
      <Button type="button" size="sm" variant="ghost" onClick={handleAdd} disabled={loading || !input.trim()} className="ml-1 text-pink-700 p-1 h-6 w-6"><Check className="w-3 h-3" /></Button>
    </div>
  );
};

export default TagEditor; 