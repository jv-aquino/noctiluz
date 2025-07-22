"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import LatexExamples from "@/components/markdown/LatexExamples";
import { Save } from "lucide-react";
import { ConteudoPage, ContentBlock } from "@/generated/prisma";

type ContentPage = ConteudoPage & { contentBlocks: ContentBlock[] };

interface LessonContentEditorProps {
  selectedPage: ContentPage | null;
  selectedBlock: ContentBlock | null;
  markdown: string;
  setMarkdown: (md: string) => void;
  saving: boolean;
  handleSaveMarkdown: () => void;
}

export default function LessonContentEditor({
  selectedPage,
  selectedBlock,
  markdown,
  setMarkdown,
  saving,
  handleSaveMarkdown,
}: LessonContentEditorProps) {
  if (!selectedPage) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma página selecionada
          </h3>
          <p className="text-gray-600 mb-4">
            Selecione uma página na barra lateral ou crie uma nova página para começar.
          </p>
        </div>
      </div>
    );
  }

  if (selectedBlock && selectedBlock.type === "MARKDOWN") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Editando: {selectedPage.name} - {selectedBlock.type.toLowerCase().replace('_', ' ')}
          </h3>
          <Button
            onClick={handleSaveMarkdown}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        <LatexExamples />
        <MarkdownEditor value={markdown} onChange={setMarkdown} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Selecione um bloco de conteúdo
        </h3>
        <p className="text-gray-600 mb-4">
          Escolha um bloco de conteúdo na barra lateral para começar a editar ou crie um novo.
        </p>
      </div>
    </div>
  );
} 