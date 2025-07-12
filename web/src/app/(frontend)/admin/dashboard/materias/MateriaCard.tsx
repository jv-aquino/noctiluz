import type { MateriaWithTopico } from "@/types";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MateriaCardProps {
  materia: MateriaWithTopico;
  onEdit?: (materia: MateriaWithTopico) => void;
  onDelete?: (materiaId: string) => void;
}

function MateriaCard({ materia, onEdit, onDelete }: MateriaCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/materia/${materia.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao deletar matéria');
      }

      toast.success('Matéria deletada com sucesso!');
      onDelete?.(materia.id);
    } catch (error) {
      console.error('Error deleting materia:', error);
      toast.error('Erro ao deletar matéria: ' + String(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-4 p-4 rounded-xl border-2 bg-white relative" style={{ borderColor: materia.cor }}>
        {/* Menu Button */}
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button
            type="button"
            className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Opções"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </button>
          
          {/* Simple Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                type="button"
                onClick={() => {
                  onEdit?.(materia);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Deletar
              </button>
            </div>
          )}
        </div>

        <h3 className="font-bold">{materia.name}</h3>

        <Image 
          src={materia.imgUrl} 
          alt={`Ícone de ${materia.name}`} 
          width={140} 
          height={140}
          className="object-contain"
        />

        <div className="flex flex-col gap-0.5">
          <p>cor - <span className="border border-black inline-block align-middle h-3.5 w-4.5" style={{ backgroundColor: materia.cor }}></span></p>
          <p><span className="font-bold">{materia.topicos.length}</span> tópicos</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Matéria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a matéria "{materia.name}"? 
              Esta ação não pode ser desfeita e também deletará o arquivo de imagem associado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
   );
}

export default MateriaCard;