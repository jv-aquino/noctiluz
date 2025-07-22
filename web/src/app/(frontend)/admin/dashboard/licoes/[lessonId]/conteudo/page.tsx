"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "../../../components/header/AdminHeader";
import { BookOpen, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import useSWR from "swr";
import { TabsContent } from "@/components/ui/tabs";
import { Lesson, ConteudoPage, ContentBlock, LessonVariant } from "@/generated/prisma";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import LessonVariantsTabs from "./LessonVariantsTabs";
import LessonContentSidebar from "./LessonContentSidebar";
import LessonContentEditor from "./LessonContentEditor";
import CreatePageDialog from "./CreatePageDialog";

type ContentPage = ConteudoPage & {
  contentBlocks: ContentBlock[];
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

  const [pageOrder, setPageOrder] = useState<string[]>([]);
  const [pageOrderChanged, setPageOrderChanged] = useState(false);
  const [blockOrder, setBlockOrder] = useState<string[]>([]);
  const [blockOrderChanged, setBlockOrderChanged] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("principal");
  const { data: variants, mutate: mutateVariants } = useSWR(
    lessonId ? `/api/lesson/${lessonId}/variant` : null,
    (url: string) => fetch(url).then(res => res.json())
  );
  const [, setSelectedVariant] = useState<string | null>(null);

  const [showNewVariantDialog, setShowNewVariantDialog] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantDescription, setNewVariantDescription] = useState("");
  const [creatingVariant, setCreatingVariant] = useState(false);

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

  useEffect(() => {
    if (contentPages) {
      setPageOrder(contentPages.map(p => p.id));
      setPageOrderChanged(false);
    }
  }, [contentPages]);

  useEffect(() => {
    if (selectedPage) {
      setBlockOrder(selectedPage.contentBlocks.map(b => b.id));
      setBlockOrderChanged(false);
    }
  }, [selectedPage]);

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
        const sortedData = [...data].sort((a, b) => a.order - b.order);
        setContentPages(sortedData);
        
        // Select first page by default
        if (sortedData.length > 0 && !selectedPage) {
          const firstPage = sortedData[0];
          setSelectedPage(firstPage);
          if (firstPage.contentBlocks.length > 0) {
            const firstBlock = firstPage.contentBlocks.find((block: ContentBlock) => block.type === 'MARKDOWN');
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
        loadContent(); // Recarregar para garantir a ordem
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
        // Recarregar tudo para simplicidade
        await loadContent();
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
    const sortedBlocks = [...page.contentBlocks].sort((a, b) => a.order - b.order);
    const firstMarkdownBlock = sortedBlocks.find(block => block.type === 'MARKDOWN');
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

  const handlePageOrderChange = (newOrder: string[]) => {
    setPageOrder(newOrder);
    setPageOrderChanged(true);
  };

  const handleBlockOrderChange = (newOrder: string[]) => {
    setBlockOrder(newOrder);
    setBlockOrderChanged(true);
  };

  const handleSavePageOrder = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/lesson/${lessonId}/conteudo/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIds: pageOrder }),
      });
      if (!res.ok) {
        throw new Error('Erro ao salvar a ordem das páginas');
      }
      toast.success('Ordem das páginas salva com sucesso!');
      setPageOrderChanged(false);
      await loadContent(); // Recarregar para refletir a nova ordem
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBlockOrder = async () => {
    if (!selectedPage) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/lesson/${lessonId}/conteudo/${selectedPage.id}/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds: blockOrder }),
      });
      if (!res.ok) {
        throw new Error('Erro ao salvar a ordem dos blocos');
      }
      toast.success('Ordem dos blocos salva com sucesso!');
      setBlockOrderChanged(false);
      await loadContent(); // Recarregar
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVariant = async () => {
    if (!newVariantName.trim()) {
      toast.error("Nome da variante é obrigatório");
      return;
    }
    setCreatingVariant(true);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/variant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVariantName, description: newVariantDescription }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar variante");
      }
      toast.success("Variante criada!");
      setShowNewVariantDialog(false);
      setNewVariantName("");
      setNewVariantDescription("");
      mutateVariants();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message || "Erro ao criar variante");
      } else {
        toast.error("Erro ao criar variante");
      }
    } finally {
      setCreatingVariant(false);
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
        <LessonVariantsTabs
          variants={variants || []}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSelectedVariant={setSelectedVariant}
          showNewVariantDialog={showNewVariantDialog}
          setShowNewVariantDialog={setShowNewVariantDialog}
          newVariantName={newVariantName}
          setNewVariantName={setNewVariantName}
          newVariantDescription={newVariantDescription}
          setNewVariantDescription={setNewVariantDescription}
          creatingVariant={creatingVariant}
          handleCreateVariant={handleCreateVariant}
        >
          <TabsContent value="principal">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <LessonContentSidebar
                  contentPages={contentPages}
                  selectedPage={selectedPage}
                  onSelectPage={handlePageSelect}
                  pageOrder={pageOrder}
                  onPageOrderChange={handlePageOrderChange}
                  pageOrderChanged={pageOrderChanged}
                  onSavePageOrder={handleSavePageOrder}
                  blockOrder={blockOrder}
                  onBlockOrderChange={handleBlockOrderChange}
                  blockOrderChanged={blockOrderChanged}
                  onSaveBlockOrder={handleSaveBlockOrder}
                  selectedBlock={selectedBlock}
                  onSelectBlock={handleBlockSelect}
                  onCreateBlock={handleCreateMarkdownBlock}
                  saving={saving}
                />
              </div>
              <div className="lg:col-span-3">
                <LessonContentEditor
                  selectedPage={selectedPage}
                  selectedBlock={selectedBlock}
                  markdown={markdown}
                  setMarkdown={setMarkdown}
                  saving={saving}
                  handleSaveMarkdown={handleSaveMarkdown}
                />
              </div>
            </div>
            <CreatePageDialog
              open={showNewPageDialog}
              onOpenChange={setShowNewPageDialog}
              newPageName={newPageName}
              setNewPageName={setNewPageName}
              onCreatePage={handleCreatePage}
              saving={saving}
            />
          </TabsContent>
          {variants && variants.map((variant: LessonVariant) => (
            <TabsContent key={variant.id} value={variant.id}>
              <div className="text-pink-700 font-semibold mb-2">Editando variante: {variant.name}</div>
              <div className="text-gray-500">(Editor de conteúdo para variantes em construção)</div>
            </TabsContent>
          ))}
        </LessonVariantsTabs>
      </div>

      {/* New Variant Dialog */}
      <Dialog open={showNewVariantDialog} onOpenChange={setShowNewVariantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Variante</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Nome da variante"
              value={newVariantName}
              onChange={e => setNewVariantName(e.target.value)}
              autoFocus
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Descrição (opcional)"
              value={newVariantDescription}
              onChange={e => setNewVariantDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVariantDialog(false)} disabled={creatingVariant}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVariant} disabled={creatingVariant || !newVariantName.trim()}>
              {creatingVariant ? 'Criando...' : 'Criar Variante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 