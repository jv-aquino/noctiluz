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
    '/api/cursos',
    (url: string) => fetcher(url, 'Erro ao buscar cursos')
  );
  const { data: materias, error: materiasError, isLoading: materiasLoading } = useSWR<Materia[]>(
    '/api/materias',
    (url: string) => fetcher(url, 'Erro ao buscar matérias')
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<CursoCompleto | null>(null);

  const handleSubmit = async (data: Omit<Curso, 'id'>, materiaIds: string[]) => {
    try {
      let response;
      let cursoId: string | undefined;
      if (editingCurso) {
        response = await fetch(`/api/cursos/${editingCurso.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        cursoId = editingCurso.id;
      } else {
        response = await fetch('/api/cursos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          const created = await response.json();
          cursoId = created.id;
        }
      }
      if (!response.ok || !cursoId) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error.message);
      }
      // Link materias after curso creation/update
      if (materiaIds && materiaIds.length > 0) {
        await Promise.all(
          materiaIds.map(materiaId =>
            fetch(`/api/cursos/materias/${materiaId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cursoId })
            })
          )
        );
      }
      mutateCursos();
      setEditingCurso(null);
      setIsDialogOpen(false);
      toast.success('Curso salvo com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar curso');
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

  const handleDelete = async (curso: CursoWithMateria) => {
    const response = await fetch(`/api/cursos/${curso.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error.message || 'Erro ao deletar curso');
    }
    mutateCursos();
  };
  const handleTagsUpdate = async (curso: CursoCompleto, tags: string[]) => {
    await fetch(`/api/cursos/${curso.id}`, {
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
          <DialogContent className="sm:max-w-[500px] rounded-lg text-foreground">
            <DialogHeader className="flex flex-row items-center justify-between pb-4">
              <DialogTitle className="text-xl font-semibold">
                {editingCurso ? 'Editar Curso' : 'Adicionar Curso'}
              </DialogTitle>
            </DialogHeader>
            {materias && (
              <CursoForm
                editingCurso={editingCurso}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitText={editingCurso ? "Salvar Alterações →" : "Adicionar Curso →"}
                materias={materias.map(m => ({ id: m.id, name: m.name }))}
                initialRelatedMaterias={editingCurso ? (editingCurso.materiasRelacionadas?.map(rel => rel.materiaId) || []) : []}
              />
            )}
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