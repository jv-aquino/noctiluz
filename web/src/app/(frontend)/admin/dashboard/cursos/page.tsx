'use client'
import { fetcher } from "@/utils";
import useSWR from 'swr'
import AdminHeader from "../components/header/AdminHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { GraduationCap } from "lucide-react";
import CursosTable from './CursosTable';
import { Curso, Materia, Topico } from '@/generated/prisma';
import { useState } from "react";
import { CursoForm } from "./CursoForm";
import { CursoWithMateria } from "@/types";

type CursoCompleto = CursoWithMateria & { alunosAtivos?: number; topicos?: Topico[] };

function CursosPage() {
  const { data: cursos, error: cursosError, isLoading: cursosLoading, mutate: mutateCursos } = useSWR<Curso[]>(
    '/api/curso',
    (url: string) => fetcher(url, 'Erro ao buscar cursos')
  );
  const { data: materias, error: materiasError, isLoading: materiasLoading } = useSWR<Materia[]>(
    '/api/materia',
    (url: string) => fetcher(url, 'Erro ao buscar matérias')
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<CursoCompleto | null>(null);

  const handleSubmit = async (data: Omit<Curso, 'id'>) => {
    try {
      let response;
      if (editingCurso) {
        response = await fetch(`/api/curso/${editingCurso.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        response = await fetch('/api/curso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar curso');
      }
      mutateCursos();
      setEditingCurso(null);
      setIsDialogOpen(false);
      toast.success('Curso salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar curso: ' + String(error));
      throw error;
    }
  };

  const handleCancel = () => {
    setEditingCurso(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (curso: CursoCompleto) => {
    setEditingCurso(curso);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {}
  // const handleDelete = async (curso: CursoWithMateria) => {
  //   // TODO: implement delete logic
  //   mutateCursos();
  // };
  const handleTagsUpdate = async (curso: CursoCompleto, tags: string[]) => {
    await fetch(`/api/curso/${curso.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags })
    });
    mutateCursos();
  };

  const Paragraph = () => (
    <>É o curso que o aluno vai estar matriculando, possuindo diversos tópicos, revisões, lista de exercícios, etc.</>
  );

  return (
    <>
      <AdminHeader Icon={GraduationCap} Paragraph={Paragraph} title="Cursos">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="admin-header-button colorTransition">
              <Plus /> Adicionar Curso
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white rounded-lg">
            <DialogHeader className="flex flex-row items-center justify-between pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingCurso ? 'Editar Curso' : 'Adicionar Curso'}
              </DialogTitle>
            </DialogHeader>
            <CursoForm
              editingCurso={editingCurso}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={editingCurso ? "Salvar Alterações →" : "Adicionar Curso →"}
            />
          </DialogContent>
        </Dialog>
      </AdminHeader>
      {(cursosLoading || materiasLoading) && <p>Carregando...</p>}
      {(cursosError || materiasError) && <p>Erro ao carregar dados.</p>}
      {cursos && materias && (
        <CursosTable
          cursos={cursos.map(c => ({
            ...c,
            alunosAtivos: 0,
            materiasRelacionadas: Array.isArray((c as CursoWithMateria).materiasRelacionadas) ? (c as CursoWithMateria).materiasRelacionadas : [],
          }))}
          materias={materias}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTagsUpdate={handleTagsUpdate}
        />
      )}
    </>
  );
}

export default CursosPage;