import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface RowMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  extraActions?: ReactNode;
}

const RowMenu = ({ onEdit, onDelete, disabled = false, extraActions }: RowMenuProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button className="cursor-pointer p-2" variant="ghost" size="icon" onClick={() => setOpen(o => !o)} disabled={disabled}>
        <MoreVertical />
      </Button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          {extraActions}
          <Button variant="ghost" className="w-full flex gap-2 items-center" onClick={() => { onEdit(); setOpen(false); }} disabled={disabled}>
            <Pencil className="w-4 h-4" /> Editar
          </Button>
          <Button variant="ghost" className="w-full flex gap-2 items-center text-red-600" onClick={() => { onDelete(); setOpen(false); }} disabled={disabled}>
            <Trash2 className="w-4 h-4" /> Deletar
          </Button>
        </div>
      )}
    </div>
  );
};

export default RowMenu; 