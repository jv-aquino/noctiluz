/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentBlock, ContentPage } from "@/generated/prisma";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

type ContentPageWithBlocks = ContentPage & { contentBlocks: ContentBlock[] }; 

export function useContentManager({ lessonId, variantId } : { lessonId: string, variantId?: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contentPages, setContentPages] = useState<ContentPageWithBlocks[]>([]);
  const [selectedPage, setSelectedPage] = useState<ContentPageWithBlocks | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [markdown, setMarkdown] = useState("");

  const [pageOrder, setPageOrder] = useState<string[]>([]);
  const [pageOrderChanged, setPageOrderChanged] = useState(false);
  const [blockOrder, setBlockOrder] = useState<string[]>([]);
  const [blockOrderChanged, setBlockOrderChanged] = useState(false);

  // load content (either by lessonId or variantId)
  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (variantId) params.set("variantId", variantId);
      else params.set("lessonId", lessonId);

      const response = await fetch(`/api/conteudo?${params.toString()}`);
      if (!response.ok) {
        toast.error("Erro ao carregar conteúdo");
        return;
      }
      const data = await response.json();
      const sorted = [...data].sort((a: any, b: any) => a.order - b.order);
      setContentPages(sorted);

      if (sorted.length > 0) {
        const firstPage = sorted[0];
        setSelectedPage((prev) => prev ?? firstPage);

        // choose first markdown block if none selected
        const sortedBlocks = [...firstPage.contentBlocks].sort((a, b) => a.order - b.order);
        const f = sortedBlocks.find((blk) => blk.type === "MARKDOWN");
        if (f) {
          setSelectedBlock((prev) => prev ?? f);
          setMarkdown(f.markdown || "");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar conteúdo");
    } finally {
      setLoading(false);
    }
  }, [lessonId, variantId]);

  // keep orders synced when content changes
  useEffect(() => {
    setPageOrder(contentPages.map(p => p.id));
    setPageOrderChanged(false);
  }, [contentPages]);

  useEffect(() => {
    if (selectedPage) {
      setBlockOrder(selectedPage.contentBlocks.map((b:any) => b.id));
      setBlockOrderChanged(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    // initial load
    loadContent();
  }, [loadContent]);

  // create a page (sends variantId if present, else lessonId)
  const createPage = async (name: string) => {
    if (!name.trim()) {
      toast.error("Nome da página é obrigatório");
      return;
    }
    try {
      setSaving(true);
      const body: any = { name };
      if (variantId) body.variantId = variantId;
      else body.lessonId = lessonId;

      const res = await fetch(`/api/conteudo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(()=> ({}));
        throw new Error(err?.error || "Erro ao criar página");
      }
      const newPage = await res.json();
      setContentPages(prev => [...prev, newPage]);
      setSelectedPage(newPage);
      toast.success("Página criada com sucesso!");
      await loadContent();
    } catch (e: any) {
      toast.error(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const createMarkdownBlock = async (pageId?: string) => {
    const targetPage = pageId ?? selectedPage?.id;
    if (!targetPage) {
      toast.error("Selecione uma página primeiro");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/conteudo/${targetPage}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          type: "MARKDOWN",
          markdown: "# Novo Conteúdo\n\nDigite seu conteúdo aqui...",
          variantId: variantId ?? undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=> ({}));
        throw new Error(err?.error || "Erro ao criar bloco");
      }
      const newBlock = await res.json();
      await loadContent();
      setSelectedBlock(newBlock);
      setMarkdown(newBlock.markdown || "");
      toast.success("Bloco de conteúdo criado!");
    } catch (e: any) {
      toast.error(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const saveMarkdown = async () => {
    if (!selectedBlock || !selectedPage) {
      toast.error("Nenhum bloco selecionado");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/conteudo/${selectedPage.id}/${selectedBlock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          variantId: variantId ?? undefined,
          markdown,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=> ({}));
        throw new Error(err?.error || "Erro ao salvar conteúdo");
      }
      const updatedBlock = await res.json();
      setContentPages(prev => prev.map(page => page.id === selectedPage.id ? {
        ...page,
        contentBlocks: page.contentBlocks.map((b:any) => b.id === selectedBlock.id ? updatedBlock : b)
      } : page));
      setSelectedBlock(updatedBlock);
      toast.success("Conteúdo salvo com sucesso!");
    } catch (e:any) {
      toast.error(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const savePageOrder = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/conteudo/order`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ lessonId, variantId: variantId ?? undefined, pageIds: pageOrder }),
      });
      if (!res.ok) throw new Error("Erro ao salvar a ordem das páginas");
      toast.success("Ordem das páginas salva com sucesso!");
      setPageOrderChanged(false);
      await loadContent();
    } catch (e:any) {
      toast.error(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const saveBlockOrder = async () => {
    if (!selectedPage) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/conteudo/${selectedPage.id}/order`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ blockIds: blockOrder, lessonId, variantId: variantId ?? undefined }),
      });
      if (!res.ok) throw new Error("Erro ao salvar a ordem dos blocos");
      toast.success("Ordem dos blocos salva com sucesso!");
      setBlockOrderChanged(false);
      await loadContent();
    } catch (e:any) {
      toast.error(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  // selection helpers
  const selectPage = (page: ContentPageWithBlocks) => {
    setSelectedPage(page);
    setSelectedBlock(null);
    setMarkdown("");
    const sortedBlocks = [...page.contentBlocks].sort((a:any,b:any) => a.order - b.order);
    const f = sortedBlocks.find((blk:any) => blk.type === "MARKDOWN");
    if (f) {
      setSelectedBlock(f);
      setMarkdown(f.markdown || "");
    }
  };

  const selectBlock = (blk: ContentBlock) => {
    setSelectedBlock(blk);
    if (blk.type === "MARKDOWN") setMarkdown(blk.markdown || "");
  };

  // expose all needed props
  return {
    // state
    loading, saving,
    contentPages, selectedPage, selectedBlock, markdown,
    pageOrder, pageOrderChanged, blockOrder, blockOrderChanged,

    // setters and handlers
    setMarkdown,
    createPage, createMarkdownBlock, saveMarkdown,
    savePageOrder, saveBlockOrder,
    selectPage, selectBlock,
    setPageOrder, setBlockOrder,
    setPageOrderChanged, setBlockOrderChanged,
    loadContent,
  };
}
