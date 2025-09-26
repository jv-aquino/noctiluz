import { useState, useMemo } from "react";
import { Pencil, Check, X, List } from "lucide-react";
import { CourseSubjectRelation, Topic } from "@/generated/prisma";
import TagEditor from '@/components/common/TagEditor';
import RowMenu from '@/components/table/RowMenu';
import DataTable, { DataTableColumn } from '@/components/table/DataTable';
import { Button } from "@/components/ui/button";
import CourseFilterBar from './CourseFilterBar';
import { CourseWithSubject } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface Subject {
  id: string;
  name: string;
}
type CompleteCourse = CourseWithSubject & {
  alunosAtivos?: number;
  topics?: Topic[];
}

interface CoursesTableProps {
  courses: CompleteCourse[];
  subjects: Subject[];
  onEdit: (curso: CompleteCourse) => void;
  onDelete: (curso: CompleteCourse) => void;
  onTagsUpdate: (curso: CompleteCourse, tags: string[]) => void;
}

const CoursesTable = ({ courses, subjects, onEdit, onDelete, onTagsUpdate }: CoursesTableProps) => {
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [tagsDraft, setTagsDraft] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState<CourseWithSubject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredCursos = useMemo(() => {
    return courses.filter(c =>
      (!subjectFilter ||
        (Array.isArray(c.relatedSubjects) &&
          c.relatedSubjects.some((rel: CourseSubjectRelation) => rel.subjectId === subjectFilter))
      ) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [courses, subjectFilter, search]);

  const startEditTags = (curso: CompleteCourse) => {
    setEditingTagsId(curso.id);
    setTagsDraft(curso.tags || []);
  };
  const cancelEditTags = () => {
    setEditingTagsId(null);
    setTagsDraft([]);
  };
  const saveTags = async (curso: CompleteCourse) => {
    setTagsLoading(true);
    try {
      await onTagsUpdate(curso, tagsDraft);
      setEditingTagsId(null);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cursoToDelete) return;
    setDeleting(true);
    try {
      await onDelete(cursoToDelete);
      toast.success('Curso deletado com sucesso!');
    } catch (error) {
      toast.error('Erro ao deletar curso: ' + String(error));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCursoToDelete(null);
    }
  };

  const columns: DataTableColumn<CompleteCourse>[] = [
    {
      key: "name",
      header: "Nome",
      className: "font-semibold",
    },
    {
      key: "topicos",
      header: "Nº de Tópicos",
      className: "text-center",
      render: (curso) => curso.topics?.length ?? 0,
    },
    {
      key: "alunosAtivos",
      header: "Alunos Ativos",
      className: "text-center",
      render: (curso) => curso.alunosAtivos ?? 0,
    },
    {
      key: "tags",
      header: "Tags",
      className: "",
      render: (curso) => editingTagsId === curso.id ? (
        <div className="flex items-center gap-2">
          <TagEditor tags={tagsDraft} onChange={setTagsDraft} loading={tagsLoading} />
          <Button onClick={() => saveTags(curso)} disabled={tagsLoading} size="icon" variant="ghost" className="text-green-700"><Check /></Button>
          <Button onClick={cancelEditTags} disabled={tagsLoading} size="icon" variant="ghost" className="text-gray-500"><X /></Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1 items-center">
          {curso.tags?.map((tag: string) => (
            <span key={tag} className="bg-pink-100 text-pink-800 rounded px-2 py-0.5 text-xs">{tag}</span>
          ))}
          <Button onClick={() => startEditTags(curso)} size="icon" variant="ghost" className="ml-2 text-pink-700"><Pencil className="w-4 h-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CourseFilterBar
        subjects={subjects}
        selectedSubject={subjectFilter}
        onSubjectChange={setSubjectFilter}
        search={search}
        onSearch={setSearch}
      />
      <DataTable
        columns={columns}
        data={filteredCursos}
        getRowKey={curso => curso.id}
        rowActions={curso => (
          <RowMenu
            onEdit={() => onEdit(curso)}
            onDelete={() => {
              setCursoToDelete(curso);
              setDeleteDialogOpen(true);
            }}
            extraActions={
              <Button variant="ghost">
                <a
                  href={`/admin/dashboard/topicos/${curso.id}`}
                  className="w-full flex gap-2 items-center font-medium px-3 py-2 text-sm hover:bg-foreground/15 border-b border-gray-100 last:border-b-0"
                  style={{ textDecoration: 'none' }}
                >
                  <List className="w-4 h-4" /> Editar tópicos
                </a>
              </Button>
            }
          />
        )}
        className="rounded-xl"
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Curso</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja deletar o curso &quot;{cursoToDelete?.name}&quot;? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoursesTable;