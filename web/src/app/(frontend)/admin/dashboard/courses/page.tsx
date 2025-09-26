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
import CoursesTable from './CoursesTable';
import { Course, Subject, Topic } from '@/generated/prisma';
import { useState } from "react";
import { CourseForm } from "./CourseForm";
import { CourseWithSubject } from "@/types";

type CompleteCourse = CourseWithSubject & { alunosAtivos?: number; topicos?: Topic[] };

function CoursesPage() {
  const { data: courses, error: coursesError, isLoading: coursesLoading, mutate: mutateCourses } = useSWR<CompleteCourse[]>(
    '/api/cursos',
    (url: string) => fetcher(url, 'Erro ao buscar cursos')
  );
  const { data: subjects, error: subjectsError, isLoading: subjectsLoading } = useSWR<Subject[]>(
    '/api/materias',
    (url: string) => fetcher(url, 'Erro ao buscar matérias')
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CompleteCourse | null>(null);

  const handleSubmit = async (data: Omit<Course, 'id'>, subjectIds: string[]) => {
    try {
      let response;
      let courseId: string | undefined;
      if (editingCourse) {
        response = await fetch(`/api/courses/${editingCourse.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        courseId = editingCourse.id;
      } else {
        response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          const created = await response.json();
          courseId = created.id;
        }
      }
      if (!response.ok || !courseId) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error.message);
      }
      // Link subjects after course creation/update
      if (subjectIds && subjectIds.length > 0) {
        await Promise.all(
          subjectIds.map(subjectId =>
            fetch(`/api/courses/subjects/${subjectId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courseId })
            })
          )
        );
      }
      mutateCourses();
      setEditingCourse(null);
      setIsDialogOpen(false);
      toast.success('Curso salvo com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar curso');
      throw error;
    }
  };

  const handleCancel = () => {
    setEditingCourse(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (course: CompleteCourse) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  const handleDelete = async (course: CompleteCourse) => {
    const response = await fetch(`/api/courses/${course.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error.message || 'Erro ao deletar curso');
    }
    mutateCourses();
  };
  const handleTagsUpdate = async (course: CompleteCourse, tags: string[]) => {
    await fetch(`/api/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags })
    });
    mutateCourses();
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
                {editingCourse ? 'Editar Curso' : 'Adicionar Curso'}
              </DialogTitle>
            </DialogHeader>
            {subjects && (
              <CourseForm
                editingCourse={editingCourse}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitText={editingCourse ? "Salvar Alterações →" : "Adicionar Curso →"}
                subjects={subjects.map(m => ({ id: m.id, name: m.name }))}
                initialRelatedSubjects={editingCourse ? (editingCourse.relatedSubjects?.map(rel => rel.subjectId) || []) : []}
              />
            )}
          </DialogContent>
        </Dialog>
      </AdminHeader>
      {(coursesLoading || subjectsLoading) && <p>Carregando...</p>}
      {(coursesError || subjectsError) && <p>Erro ao carregar dados.</p>}
      {courses && subjects && (
        <CoursesTable
          courses={courses.map(c => ({
            ...c,
            alunosAtivos: 0,
            materiasRelacionadas: Array.isArray((c as CourseWithSubject).relatedSubjects) ? (c as CourseWithSubject).relatedSubjects : [],
          }))}
          subjects={subjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTagsUpdate={handleTagsUpdate}
        />
      )}
    </>
  );
}

export default CoursesPage;