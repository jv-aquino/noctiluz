'use client'
import { LibraryBig, Plus } from "lucide-react";
import { useState } from "react";
import { fetcher } from "@/utils";
import useSWR from 'swr'
import AdminHeader from "../components/header/AdminHeader";
import SubjectCard from "./SubjectCard";
import SubjectForm from "./SubjectForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import type { SubjectWithTopic } from "@/types";
import { Subject } from "@/generated/prisma";


function SubjectsPage() {
  const { data: subjects, error, isLoading, mutate } = useSWR<SubjectWithTopic[]>('/api/subjects', (url: string) => fetcher(url, 'Erro ao criar matéria'))
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithTopic | null>(null);
  
  const handleSubmit = async (data: Omit<Subject, 'id'>) => {
    try {
      let response;
      if (editingSubject) {
        response = await fetch(`/api/subjects/${editingSubject.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        response = await fetch('/api/subjects', {
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
      setEditingSubject(null);
      setIsDialogOpen(false);
      toast.success('Matéria salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar matéria: ' + String(error));
      throw error;
    }
  };

  const handleCancel = () => {
    setEditingSubject(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (subject: SubjectWithTopic) => {
    setEditingSubject(subject);
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
          <DialogContent className="sm:max-w-[500px] rounded-lg">
            <DialogHeader className="flex flex-row items-center justify-between pb-4">
              <DialogTitle className="text-xl font-semibold">
                {editingSubject ? 'Editar Matéria' : 'Adicionar Matéria'}
              </DialogTitle>
            </DialogHeader>
            
            <SubjectForm
              editingSubject={editingSubject}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={editingSubject ? "Salvar Alterações →" : "Adicionar Matéria →"}
            />
          </DialogContent>
        </Dialog>
      </AdminHeader>

      <main className="grid gap-4 justify-center grid-cols-[repeat(auto-fit,_minmax(0,_260px))]">
        {isLoading && <p>Carregando matérias...</p>}
        {error && <p>Erro ao carregar matérias.</p>}
        {subjects?.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </main>
    </>
   );
}

export default SubjectsPage;