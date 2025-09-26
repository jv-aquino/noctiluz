/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/utils";
import AdminHeader from "../../components/header/AdminHeader";
import { List } from "lucide-react";
import TopicoForm from "./TopicForm";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ReorderableList } from "@/components/common/ReorderableList";
import { TopicItem } from "./TopicItem";

function TopicsCursoPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const { data: course, error, isLoading, mutate } = useSWR(
    courseId ? `/api/courses/${courseId}` : null,
    (url: string) => fetcher(url, "Erro ao buscar curso")
  );
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topicosOrder, setTopicosOrder] = useState<string[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (course?.courseTopics) {
      // Sort topics by order before setting the state
      const sortedTopics = [...course.courseTopics].sort((a, b) => a.order - b.order);
      setTopicosOrder(sortedTopics.map((ct: any) => ct.topic.id));
      setOrderChanged(false);
    }
  }, [course?.courseTopics]);

  useEffect(() => {
    if (course && (!Array.isArray(course.relatedSubjects) || course.relatedSubjects.length === 0)) {
      toast.error("Adicione uma ou mais matérias para o curso");
      router.replace("/admin/dashboard/courses");
    }
  }, [course, router]);

  // Replace handleAddTopic to do both steps (create topic, then associate)
  const handleAddTopic = async (data: { name: string; description: string; slug: string; subjectId: string }) => {
    setLoading(true);
    try {
      // 1. Create the topic
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar tópico");
      }
      const topic = await res.json();
      // 2. Associate with course (order = last)
      const relRes = await fetch(`/api/courses/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, topicId: topic.id }),
      });
      if (!relRes.ok) {
        const err = await relRes.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao associar tópico ao curso");
      }
      setTopicosOrder((prev) => [...prev, topic.id]);
      toast.success("Tópico criado com sucesso!");
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar tópico");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (newOrder: string[]) => {
    setTopicosOrder(newOrder);
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    try {
      await fetch("/api/cursos/topicos/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, topicIds: topicosOrder }),
      });
      toast.success("Ordem dos tópicos salva!");
      setOrderChanged(false);
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar ordem");
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao deletar tópico");
      }
      setTopicosOrder((prev) => prev.filter(id => id !== topicId));
      toast.success("Tópico deletado com sucesso!");
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Erro ao deletar tópico");
    }
  };

  const confirmDelete = (topic: { id: string; name: string }) => {
    setTopicToDelete(topic);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!topicToDelete) return;
    setDeleting(true);
    try {
      await handleDeleteTopic(topicToDelete.id);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    }
  };

  const renderTopicItem = (topic: any) => {
    return (
     <TopicItem topic={topic} onDelete={() => confirmDelete({ id: topic.id, name: topic.name })} />
    );
  };

  const Paragraph = () => (
    <>Visualize e organize os tópicos deste curso. Em breve: reordenação e gerenciamento de lições.</>
  );

  return (
    <>
      <AdminHeader Icon={List} Paragraph={Paragraph} title={course ? `Tópicos de ${course.name}` : "Tópicos"}>
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
          subjects={course?.relatedSubjects?.map((rel: any) => rel.subject) || []}
          onSubmit={handleAddTopic}
          loading={loading}
        />
      </AdminHeader>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Tópicos em ordem:</h2>
        {isLoading && <p>Carregando curso...</p>}
        {error && <p>Erro ao carregar curso.</p>}
        {course && course.courseTopics && course.courseTopics.length > 0 ? (
          <>
            <ReorderableList
              items={topicosOrder.map(id => course.courseTopics.find((ct: any) => ct.topic.id === id)?.topic).filter(Boolean)}
              onOrderChange={handleOrderChange}
              renderItem={renderTopicItem}
              className="space-y-2"
            />
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
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Tópico</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja deletar o tópico &quot;{topicToDelete?.name}&quot;? Esta ação não pode ser desfeita.</p>
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

export default TopicsCursoPage; 