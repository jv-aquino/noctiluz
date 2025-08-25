/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentBlock, ContentPage } from "@/generated/prisma";
import { useEffect, useState, useCallback, useRef } from "react";
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

  // load counter to ignore stale responses (prevents race conditions when switching variants fast)
  const loadCounterRef = useRef(0);

  // load content (either by lessonId or variantId)
  const loadContent = useCallback(async () => {
    const currentLoadId = ++loadCounterRef.current;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (variantId) params.set("variantId", variantId);
      else params.set("lessonId", lessonId);

      const response = await fetch(`/api/conteudos?${params.toString()}`);
      // if a newer load started while we awaited, ignore this response
      if (loadCounterRef.current !== currentLoadId) return;

      if (!response.ok) {
        toast.error("Erro ao carregar conteúdo");
        return;
      }
      const data = await response.json();
      const sorted = [...data].sort((a: any, b: any) => a.order - b.order);

      // ignore if newer load happened
      if (loadCounterRef.current !== currentLoadId) return;

      setContentPages(sorted);

      if (sorted.length > 0) {
        const firstPage = sorted[0];

        // IMPORTANT: when loading variant content, always replace previous selection.
        // For principal content we preserve existing selection when present (prev ?? firstPage).
        setSelectedPage(prev => (variantId ? firstPage : (prev ?? firstPage)));

        // choose first markdown block if none selected OR when variantId changed
        const sortedBlocks = [...firstPage.contentBlocks].sort((a, b) => a.order - b.order);
        const f = sortedBlocks.find((blk:any) => blk.type === "MARKDOWN");

        if (f) {
          setSelectedBlock(prev => (variantId ? f : (prev ?? f)));

          // set markdown: if we're switching variants (variantId present) replace markdown,
          // otherwise only set markdown when nothing selected previously.
          setMarkdown(prevMd => (variantId ? (f.markdown || "") : (prevMd || f.markdown || "")));
        } else {
          // no markdown block found: clear block selection & markdown when variant (or no prior)
          setSelectedBlock(prev => (variantId ? null : prev));
          if (variantId) setMarkdown("");
        }
      } else {
        // no pages at all -> clear selections
        setSelectedPage(null);
        setSelectedBlock(null);
        setMarkdown("");
      }
    } catch (err: unknown) {
      // ignore stale errors if a newer load happened
      if (loadCounterRef.current !== currentLoadId) return;
      console.error(err);
      toast.error("Erro ao carregar conteúdo");
    } finally {
      // only clear loading if this is the latest load
      if (loadCounterRef.current === currentLoadId) setLoading(false);
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
    // initial load (and reload when lessonId/variantId changes)
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

      const res = await fetch(`/api/conteudos`, {
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
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : 'Erro desconhecido'));
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
      const res = await fetch(`/api/conteudos/${targetPage}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MARKDOWN",
          markdown: "# Novo Conteúdo\n\nDigite seu conteúdo aqui...",
          lessonId: variantId ? undefined : lessonId,
          variantId
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
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : 'Erro desconhecido'));
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
      const res = await fetch(`/api/conteudos/${selectedPage.id}/${selectedBlock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: variantId ? undefined : lessonId,
          variantId,
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
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const savePageOrder = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/conteudos/order`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          lessonId: variantId ? undefined : lessonId,
          variantId,
          pageIds: pageOrder
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar a ordem das páginas");
      toast.success("Ordem das páginas salva com sucesso!");
      setPageOrderChanged(false);
      await loadContent();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const saveBlockOrder = async () => {
    if (!selectedPage) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/conteudos/${selectedPage.id}/order`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          blockIds: blockOrder,
          lessonId: variantId ? undefined : lessonId,
          variantId
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar a ordem dos blocos");
      toast.success("Ordem dos blocos salva com sucesso!");
      setBlockOrderChanged(false);
      await loadContent();
    } catch (error: unknown) {
      toast.error((error instanceof Error ? error.message : 'Erro desconhecido'));
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
