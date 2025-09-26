"use client";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/utils';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ReorderableList } from '@/components/common/ReorderableList';
import { TopicLesson, Lesson } from '@/generated/prisma';
import toast from 'react-hot-toast';

interface LessonsListProps {
  topicId: string;
}

function LessonItem({ lesson, onRemove }: { lesson: Lesson; onRemove: (lessonId: string) => void }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white border rounded-md">
      <span className="text-sm">{lesson.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-500 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(lesson.id);
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function LessonsList({ topicId }: LessonsListProps) {
  const { data: topicLessons, error: topicLessonsError, mutate: mutateTopicLessons } = useSWR(
    `/api/lessons/topics/${topicId}`,
    (url: string) => fetcher(url, 'Erro ao buscar lições do tópico'),
    { revalidateOnFocus: false }
  );
  
  const { data: allLessons, error: allLessonsError } = useSWR(
    `/api/lessons`,
    (url: string) => fetcher(url, 'Erro ao buscar todas as lições'),
    { revalidateOnFocus: false }
  );

  const [lessonOrder, setLessonOrder] = useState<string[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  useEffect(() => {
    if (topicLessons) {
      const sortedLessons = [...topicLessons as TopicLessonWithLesson[]].sort((a, b) => a.order - b.order);
      setLessonOrder(sortedLessons.filter((l: TopicLessonWithLesson) => l.lesson && l.lesson.id).map((l: TopicLessonWithLesson) => l.lesson!.id));
      setOrderChanged(false);
    }
  }, [topicLessons]);

  const handleOrderChange = (newOrder: string[]) => {
    setLessonOrder(newOrder);
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    try {
      await fetch(`/api/lessons/topics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, lessonIds: lessonOrder }),
      });
      toast.success('Ordem das lições salva!');
      setOrderChanged(false);
      mutateTopicLessons();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message || 'Erro ao salvar ordem');
      } else {
        toast.error('Erro ao salvar ordem');
      }
    }
  };

  const handleAddLesson = async () => {
    if (!selectedLesson) {
      toast.error('Selecione uma lição');
      return;
    }
    try {
      await fetch(`/api/lessons/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, lessonId: selectedLesson }),
      });
      toast.success('Lição adicionada!');
      setAddDialogOpen(false);
      mutateTopicLessons();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message || 'Erro ao adicionar lição');
      } else {
        toast.error('Erro ao adicionar lição');
      }
    }
  };

  const handleRemoveLesson = async (lessonId: string) => {
    if (!confirm('Tem certeza que deseja desvincular esta lição?')) return;

    try {
      await fetch(`/api/lessons/topics/${topicId}?lessonId=${lessonId}`, {
        method: 'DELETE',
      });
      toast.success('Lição desvinculada!');
      mutateTopicLessons();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message || 'Erro ao desvincular lição');
      } else {
        toast.error('Erro ao desvincular lição');
      }
    }
  };

  type TopicLessonWithLesson = TopicLesson & { lesson?: Lesson };

  const availableLessons = allLessons?.filter(
    (lesson: Lesson) => !(topicLessons as TopicLessonWithLesson[])?.some((tl: TopicLessonWithLesson) => tl.lesson && tl.lesson.id === lesson.id)
  ) || [];

  const filteredLessons = availableLessons.filter((lesson: Lesson) =>
    lesson.name.toLowerCase().includes(search.toLowerCase())
  );

  if (topicLessonsError || allLessonsError) return <div>Falha ao carregar.</div>;
  if (!topicLessons || !allLessons) return <div>Carregando lições...</div>;

  return (
    <div className="space-y-4">
      {(topicLessons as TopicLessonWithLesson[]).filter((l: TopicLessonWithLesson) => l.lesson && l.lesson.id).length > 0 ? (
        <ReorderableList
          items={lessonOrder.map(id => {
            const found = (topicLessons as TopicLessonWithLesson[]).find((l: TopicLessonWithLesson) => l.lesson && l.lesson.id === id);
            return found?.lesson;
          }).filter((l): l is Lesson => Boolean(l))}
          onOrderChange={handleOrderChange}
          renderItem={(lesson: Lesson) => <LessonItem lesson={lesson} onRemove={handleRemoveLesson} />}
          className="space-y-2"
        />
      ) : (
        <p className="text-sm text-gray-500">Nenhuma lição vinculada a este tópico.</p>
      )}

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Lição
        </Button>
        {orderChanged && (
          <Button size="sm" variant="outline" onClick={handleSaveOrder}>
            Salvar Ordem
          </Button>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Lição ao Tópico</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Buscar lição pelo nome..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') {
                  setHighlightedIndex(i => Math.min(i + 1, filteredLessons.length - 1));
                } else if (e.key === 'ArrowUp') {
                  setHighlightedIndex(i => Math.max(i - 1, 0));
                } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                  setSelectedLesson(filteredLessons[highlightedIndex].id);
                }
              }}
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto border rounded bg-white">
              {filteredLessons.length === 0 && (
                <p className="text-sm text-gray-500 p-2">Nenhuma lição encontrada.</p>
              )}
              {filteredLessons.map((lesson: Lesson, idx: number) => (
                <div
                  key={lesson.id}
                  className={`p-2 cursor-pointer hover:bg-pink-100 ${selectedLesson === lesson.id ? 'bg-pink-200' : ''} ${highlightedIndex === idx ? 'bg-pink-100' : ''}`}
                  onClick={() => setSelectedLesson(lesson.id)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {lesson.name}
                </div>
              ))}
            </div>
            {availableLessons.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Todas as lições já foram adicionadas.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddLesson} disabled={!selectedLesson}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 