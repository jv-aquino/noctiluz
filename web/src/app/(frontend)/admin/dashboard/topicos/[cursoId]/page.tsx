/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/utils";
import AdminHeader from "../../components/header/AdminHeader";
import { List } from "lucide-react";
import TopicoForm from "./TopicoForm";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

function SortableItem({ id, children, onDelete }: { id: string; children: React.ReactNode; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };
  return (
    <li ref={setNodeRef} style={style} className="p-2 border rounded bg-white flex items-center justify-between gap-2">
      <div className="flex items-center gap-2" {...attributes} {...listeners}>
        {children}
      </div>
      <div onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </li>
  );
}

function TopicosCursoPage() {
  const router = useRouter();
  const params = useParams();
  const cursoId = params?.cursoId as string;
  const { data: curso, error, isLoading, mutate } = useSWR(
    cursoId ? `/api/curso/${cursoId}` : null,
    (url: string) => fetcher(url, "Erro ao buscar curso")
  );
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topicosOrder, setTopicosOrder] = useState<string[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicoToDelete, setTopicoToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (curso?.cursoTopicos) {
      setTopicosOrder(curso.cursoTopicos.map((ct: any) => ct.topico.id));
      setOrderChanged(false);
    }
  }, [curso?.cursoTopicos]);

  useEffect(() => {
    if (curso && (!Array.isArray(curso.materiasRelacionadas) || curso.materiasRelacionadas.length === 0)) {
      toast.error("Adicione uma ou mais matérias para o curso");
      router.replace("/admin/dashboard/cursos");
    }
  }, [curso, router]);

  const sensors = useSensors(useSensor(PointerSensor));

  // Replace handleAddTopico to do both steps (create topico, then associate)
  const handleAddTopico = async (data: { name: string; descricao: string; slug: string; materiaId: string }) => {
    setLoading(true);
    try {
      // 1. Create the topico
      const res = await fetch("/api/topico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar tópico");
      }
      const topico = await res.json();
      // 2. Associate with curso (order = last)
      const relRes = await fetch(`/api/curso/topico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursoId, topicoId: topico.id }),
      });
      if (!relRes.ok) {
        const err = await relRes.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao associar tópico ao curso");
      }
      setTopicosOrder((prev) => [...prev, topico.id]);
      toast.success("Tópico criado com sucesso!");
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar tópico");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTopicosOrder((items) => {
        const newOrder = arrayMove(items, items.indexOf(active.id), items.indexOf(over.id));
        setOrderChanged(true);
        return newOrder;
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      await fetch("/api/curso/topico/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursoId, topicoIds: topicosOrder }),
      });
      toast.success("Ordem dos tópicos salva!");
      setOrderChanged(false);
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar ordem");
    }
  };

  const handleDeleteTopico = async (topicoId: string) => {
    try {
      const res = await fetch(`/api/topico/${topicoId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao deletar tópico");
      }
      setTopicosOrder((prev) => prev.filter(id => id !== topicoId));
      toast.success("Tópico deletado com sucesso!");
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao deletar tópico");
    }
  };

  const confirmDelete = (topico: { id: string; name: string }) => {
    setTopicoToDelete(topico);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!topicoToDelete) return;
    setDeleting(true);
    try {
      await handleDeleteTopico(topicoToDelete.id);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setTopicoToDelete(null);
    }
  };

  const Paragraph = () => (
    <>Visualize e organize os tópicos deste curso. Em breve: reordenação e gerenciamento de lições.</>
  );

  return (
    <>
      <AdminHeader Icon={List} Paragraph={Paragraph} title={curso ? `Tópicos de ${curso.name}` : "Tópicos"}>
        <button
          type="button"
          className="admin-header-button colorTransition"
          onClick={() => setFormOpen(true)}
        >
          <Plus /> Adicionar Tópico
        </button>
        <TopicoForm
          open={formOpen}
          onOpenChange={setFormOpen}
          materias={curso?.materiasRelacionadas?.map((rel: any) => rel.materia) || []}
          onSubmit={handleAddTopico}
          loading={loading}
        />
      </AdminHeader>
      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="text-lg font-semibold mb-4">Tópicos em ordem:</h2>
        {isLoading && <p>Carregando curso...</p>}
        {error && <p>Erro ao carregar curso.</p>}
        {curso && curso.cursoTopicos && curso.cursoTopicos.length > 0 ? (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={topicosOrder} strategy={verticalListSortingStrategy}>
                <ol className="list-decimal pl-6 space-y-2">
                  {topicosOrder.map((id) => {
                    const ct = curso.cursoTopicos.find((ct: any) => ct.topico.id === id);
                    if (!ct) return null;
                    const topico = ct.topico;
                    return (
                      <SortableItem key={topico.id} id={topico.id} onDelete={() => confirmDelete({ id: topico.id, name: topico.name })}>
                        <span className="inline-block w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: topico.materia?.cor || '#eee' }} />
                        <span className="font-medium">{topico.name}</span>
                        <span className="ml-2 text-gray-500">({topico.slug})</span>
                      </SortableItem>
                    );
                  })}
                </ol>
              </SortableContext>
            </DndContext>
            {orderChanged && (
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveOrder} disabled={loading}>
                  Salvar ordem
                </Button>
              </div>
            )}
          </>
        ) : (
          <p>Nenhum tópico cadastrado para este curso.</p>
        )}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            Funcionalidades de reordenação e gerenciamento de lições serão implementadas aqui.
          </p>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Tópico</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja deletar o tópico &quot;{topicoToDelete?.name}&quot;? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button onClick={executeDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TopicosCursoPage; 