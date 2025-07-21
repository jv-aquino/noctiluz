"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "../../../components/header/AdminHeader";
import { BookOpen, ArrowLeft, Plus, Save, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import LatexExamples from "@/components/markdown/LatexExamples";
import toast from "react-hot-toast";

interface ContentPage {
  id: string;
  name: string;
  order: number;
  archived: boolean;
  contentBlocks: ContentBlock[];
}

interface ContentBlock {
  id: string;
  type: 'MARKDOWN' | 'VIDEO' | 'INTERACTIVE_COMPONENT' | 'EXERCISE' | 'SIMULATION' | 'ASSESSMENT';
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

interface Lesson {
  id: string;
  name: string;
  descricao: string;
  type: string;
}

export default function LessonContentPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState("");

  const Paragraph = () => (
    <>Edite o conteúdo da lição usando Markdown e LaTeX para criar conteúdo educacional rico.</>
  );

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      loadContent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const response = await fetch(`/api/lesson/${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        setLesson(data);
      } else {
        toast.error('Erro ao carregar lição');
        router.push('/admin/dashboard/licoes');
      }
    } catch (error) {
      console.error('Erro ao carregar lição:', error);
      toast.error('Erro ao carregar lição');
      router.push('/admin/dashboard/licoes');
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lesson/${lessonId}/conteudo`);
      if (response.ok) {
        const data = await response.json();
        setContentPages(data);
        
        // Select first page by default
        if (data.length > 0 && !selectedPage) {
          setSelectedPage(data[0]);
          if (data[0].contentBlocks.length > 0) {
            const firstBlock = data[0].contentBlocks.find((block: ContentBlock) => block.type === 'MARKDOWN');
            if (firstBlock) {
              setSelectedBlock(firstBlock);
              setMarkdown(firstBlock.markdown || "");
            }
          }
        }
      } else {
        toast.error('Erro ao carregar conteúdo');
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      toast.error('Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPageName.trim()) {
      toast.error('Nome da página é obrigatório');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/lesson/${lessonId}/conteudo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newPageName }),
      });

      if (response.ok) {
        const newPage = await response.json();
        setContentPages(prev => [...prev, newPage]);
        setSelectedPage(newPage);
        setShowNewPageDialog(false);
        setNewPageName("");
        toast.success('Página criada com sucesso!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao criar página');
      }
    } catch (error) {
      toast.error('Erro ao criar página: ' + String(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMarkdownBlock = async () => {
    if (!selectedPage) {
      toast.error('Selecione uma página primeiro');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/lesson/${lessonId}/conteudo/${selectedPage.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'MARKDOWN',
          markdown: '# Novo Conteúdo\n\nDigite seu conteúdo aqui...',
        }),
      });

      if (response.ok) {
        const newBlock = await response.json();
        setContentPages(prev => prev.map(page => 
          page.id === selectedPage.id 
            ? { ...page, contentBlocks: [...page.contentBlocks, newBlock] }
            : page
        ));
        setSelectedBlock(newBlock);
        setMarkdown(newBlock.markdown || "");
        toast.success('Bloco de conteúdo criado!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao criar bloco');
      }
    } catch (error) {
      toast.error('Erro ao criar bloco: ' + String(error));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarkdown = async () => {
    if (!selectedBlock) {
      toast.error('Nenhum bloco selecionado');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/lesson/${lessonId}/conteudo/${selectedPage?.id}/${selectedBlock.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown: markdown,
        }),
      });

      if (response.ok) {
        const updatedBlock = await response.json();
        setContentPages(prev => prev.map(page => 
          page.id === selectedPage?.id 
            ? {
                ...page,
                contentBlocks: page.contentBlocks.map(block =>
                  block.id === selectedBlock.id ? updatedBlock : block
                )
              }
            : page
        ));
        setSelectedBlock(updatedBlock);
        toast.success('Conteúdo salvo com sucesso!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar conteúdo');
      }
    } catch (error) {
      toast.error('Erro ao salvar conteúdo: ' + String(error));
    } finally {
      setSaving(false);
    }
  };

  const handlePageSelect = (page: ContentPage) => {
    setSelectedPage(page);
    setSelectedBlock(null);
    setMarkdown("");
    
    // Select first markdown block if available
    const firstMarkdownBlock = page.contentBlocks.find(block => block.type === 'MARKDOWN');
    if (firstMarkdownBlock) {
      setSelectedBlock(firstMarkdownBlock);
      setMarkdown(firstMarkdownBlock.markdown || "");
    }
  };

  const handleBlockSelect = (block: ContentBlock) => {
    setSelectedBlock(block);
    if (block.type === 'MARKDOWN') {
      setMarkdown(block.markdown || "");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <>
      <AdminHeader Icon={BookOpen} Paragraph={Paragraph} title={`Conteúdo - ${lesson?.name || 'Lição'}`}>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/dashboard/licoes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            onClick={() => setShowNewPageDialog(true)}
            className="admin-header-button"
            disabled={saving}
          >
            <Plus className="w-4 h-4" />
            Nova Página
          </Button>
        </div>
      </AdminHeader>

      <div className="w-full mx-2 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Pages and Blocks */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Páginas</h3>
              
              {contentPages.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">
                  Nenhuma página criada ainda. Crie sua primeira página para começar.
                </p>
              ) : (
                <div className="space-y-2 mb-6">
                  {contentPages.map((page) => (
                    <div
                      key={page.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPage?.id === page.id
                          ? 'bg-pink-100 border border-pink-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => handlePageSelect(page)}
                    >
                      <h4 className="font-medium text-sm">{page.name}</h4>
                      <p className="text-xs text-gray-500">
                        {page.contentBlocks.length} blocos
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedPage && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Blocos de Conteúdo</h4>
                    <Button
                      size="sm"
                      onClick={handleCreateMarkdownBlock}
                      disabled={saving}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Markdown
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {selectedPage.contentBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                          selectedBlock?.id === block.id
                            ? 'bg-pink-200 border border-pink-400'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleBlockSelect(block)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{block.type.toLowerCase()}</span>
                          {block.type === 'MARKDOWN' && (
                            <Edit3 className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedBlock && selectedBlock.type === 'MARKDOWN' ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Editando: {selectedPage?.name} - {selectedBlock.type}
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
            ) : selectedPage ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione um bloco de conteúdo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Escolha um bloco de conteúdo na barra lateral para começar a editar.
                  </p>
                  <Button onClick={handleCreateMarkdownBlock} disabled={saving}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Bloco Markdown
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma página selecionada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Selecione uma página na barra lateral ou crie uma nova página para começar.
                  </p>
                  <Button onClick={() => setShowNewPageDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Página
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Page Dialog */}
      {showNewPageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Criar Nova Página</h3>
            <input
              type="text"
              placeholder="Nome da página"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePage()}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewPageDialog(false);
                  setNewPageName("");
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePage}
                disabled={saving || !newPageName.trim()}
              >
                {saving ? 'Criando...' : 'Criar Página'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 