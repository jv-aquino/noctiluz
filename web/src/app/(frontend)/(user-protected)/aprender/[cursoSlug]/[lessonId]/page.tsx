"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/utils";
import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import { BookOpen } from "lucide-react";

interface ContentBlock {
  id: string;
  type: string;
  order: number;
  markdown?: string;
  videoUrl?: string;
  metadata?: Record<string, unknown>;
  componentType?: string;
  componentPath?: string;
  componentProps?: Record<string, unknown>;
  exerciseData?: Record<string, unknown>;
  archived: boolean;
}

interface ContentPage {
  id: string;
  name: string;
  order: number;
  archived: boolean;
  contentBlocks: ContentBlock[];
}

export default function LessonViewPage() {
  const params = useParams();
  const { lessonId } = params as { cursoSlug: string; topicoSlug: string; lessonId: string };

  // Fetch lesson data (including contentPages)
  const { data: lesson, error: lessonError } = useSWR(
    lessonId ? `/api/lesson/${lessonId}` : null,
    (url: string) => fetcher(url, "Erro ao buscar lição")
  );
  
  // Fetch content pages for the lesson
  const createSearchParams = new URLSearchParams({ lessonId });
  const { data: contentPages, error: contentError } = useSWR(
    lessonId ? `/api/conteudo?${createSearchParams.toString()}` : null,
    (url: string) => fetcher(url, "Erro ao buscar páginas de conteúdo")
  );

  const [currentStep, setCurrentStep] = useState(0);

  if (lessonError || contentError) return <div className="p-8 text-red-600">Erro ao carregar lição.</div>;
  if (!lesson || !contentPages) return <div className="p-8">Carregando...</div>;

  const sortedPages: ContentPage[] = [...contentPages].sort((a, b) => a.order - b.order);
  const currentPage = sortedPages[currentStep];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-pink-600" />
        <h1 className="text-2xl font-bold">{lesson.name}</h1>
        <span className="ml-2 text-gray-500 text-sm">{lesson.descricao}</span>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600">Página {currentStep + 1} de {sortedPages.length}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentStep(s => Math.min(sortedPages.length - 1, s + 1))}
            disabled={currentStep === sortedPages.length - 1}
          >
            Próxima
          </Button>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">{currentPage.name}</h2>
        {currentPage.contentBlocks.length === 0 && (
          <p className="text-gray-500">Nenhum conteúdo nesta página.</p>
        )}
        {currentPage.contentBlocks.map(block => (
          <div key={block.id} className="mb-4">
            {block.type === "MARKDOWN" && block.markdown && (
              <MarkdownViewer markdown={block.markdown} />
            )}
            {block.type === "VIDEO" && block.videoUrl && (
              <video controls className="w-full rounded">
                <source src={block.videoUrl} />
                Seu navegador não suporta vídeo.
              </video>
            )}
            {/* TODO: Render other block types (interactive, exercise, etc.) */}
          </div>
        ))}
      </div>
    </div>
  );
} 