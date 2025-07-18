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

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 border rounded bg-white flex items-center gap-2">
      {children}
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

  useEffect(() => {
    if (curso?.topicos) {
      setTopicosOrder(curso.topicos.map((t: any) => t.id));
      setOrderChanged(false);
    }
  }, [curso?.topicos]);

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
                      <SortableItem key={topico.id} id={topico.id}>
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
    </>
  );
}

export default TopicosCursoPage; 