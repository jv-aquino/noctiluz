import type { MateriaWithTopico } from "@/types";
import { Pencil } from "lucide-react";
import Image from "next/image";

interface MateriaCardProps {
  materia: MateriaWithTopico
}

function MateriaCard({ materia }: MateriaCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-xl border-2" style={{ borderColor: materia.cor }}>
      <h3 className="font-bold">{materia.name}</h3>

      <Image src={materia.imgUrl} alt={`Ícone de ${materia.name}`} width={100} height={100
        
      } />

      <div className="flex flex-col gap-0.5">
        <p>cor - <span className="border border-black inline-block align-middle h-3.5 w-4.5" style={{ backgroundColor: materia.cor }}></span></p>
        <p><span className="font-bold">{materia.topicos.length}</span> tópicos</p>
      </div>

      <button type="button" className="font-medium text-md bg-pink-600 text-pink-50 rounded-xl py-1.5 px-2
      flex items-center gap-1.5">
        <Pencil className="h-4.5 w-4.5" /> Editar
      </button>
    </div>
   );
}

export default MateriaCard;