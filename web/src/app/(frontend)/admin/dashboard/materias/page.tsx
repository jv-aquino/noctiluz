'use client'
import type { MateriaWithTopico } from "@/types";
import { LibraryBig, Plus } from "lucide-react";
import { useState } from "react";
import { fetcher } from "@/utils";
import useSWR from 'swr'
import AdminHeader from "../components/header/AdminHeader";
import MateriaCard from "./MateriaCard";
import { MateriaForm } from "./MateriaForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Materia } from "@/generated/prisma";


function MateriasPage() {
  const { data: materias, error, isLoading, mutate } = useSWR<MateriaWithTopico[]>('/api/materias', (url: string) => fetcher(url, 'Erro ao criar matéria'))
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState<MateriaWithTopico | null>(null);
  
  const handleSubmit = async (data: Omit<Materia, 'id'>) => {
    try {
      let response;
      if (editingMateria) {
        response = await fetch(`/api/materias/${editingMateria.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        response = await fetch('/api/materias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar matéria');
      }

      mutate();
      setEditingMateria(null);
      setIsDialogOpen(false);
      toast.success('Matéria salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar matéria: ' + String(error));
      throw error;
    }
  };

  const handleCancel = () => {
    setEditingMateria(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (materia: MateriaWithTopico) => {
    setEditingMateria(materia);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    mutate();
  };

  const Paragraph = () => (
    <>
      São as bases/grandes áreas de conhecimento. A edição aqui é mais estética e serve para depois adicionar tópicos cuja origem é essa matéria
    </>
  )

  return ( 
    <>
      <AdminHeader
        Icon={LibraryBig}
        Paragraph={Paragraph}
        title="Matérias"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="admin-header-button colorTransition">
              <Plus /> Adicionar Matérias
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white rounded-lg">
            <DialogHeader className="flex flex-row items-center justify-between pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingMateria ? 'Editar Matéria' : 'Adicionar Matéria'}
              </DialogTitle>
            </DialogHeader>
            
            <MateriaForm
              editingMateria={editingMateria}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={editingMateria ? "Salvar Alterações →" : "Adicionar Matéria →"}
            />
          </DialogContent>
        </Dialog>
      </AdminHeader>

      <main className="grid gap-4 justify-center grid-cols-[repeat(auto-fit,_minmax(0,_260px))]">
        {isLoading && <p>Carregando matérias...</p>}
        {error && <p>Erro ao carregar matérias.</p>}
        {materias?.map(materia => (
          <MateriaCard 
            key={materia.id} 
            materia={materia} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </main>
    </>
   );
}

export default MateriasPage;