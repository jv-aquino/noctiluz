"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "../../../components/header/AdminHeader";
import { BookOpen, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import useSWR from "swr";
import { TabsContent } from "@/components/ui/tabs";
import { Lesson, LessonVariant } from "@/generated/prisma";
import LessonVariantsTabs from "./LessonVariantsTabs";
import LessonContentSidebar from "./LessonContentSidebar";
import LessonContentEditor from "./LessonContentEditor";
import CreatePageDialog from "./CreatePageDialog";
import { useContentManager } from "@/hooks/use-content-manager";
import NewPageButton from "./NewPageButton";

export default function LessonContentPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);

  const { data: variants, mutate: mutateVariants } = useSWR(
    lessonId ? `/api/lessons/${lessonId}/variants` : null,
    (url: string) => fetch(url).then(res => res.json())
  );

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("principal");
  const [showNewVariantDialog, setShowNewVariantDialog] = useState(false);

  // variant creation states
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantSlug, setNewVariantSlug] = useState("");
  const [newVariantDescription, setNewVariantDescription] = useState("");
  const [newVariantIsDefault, setNewVariantIsDefault] = useState(false);
  const [newVariantWeight, setNewVariantWeight] = useState<number>(100);
  const [newVariantIsActive, setNewVariantIsActive] = useState(true);
  const [creatingVariant, setCreatingVariant] = useState(false);

  // principal dialog state
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState("");

  // variant dialog state
  const [showNewVariantPageDialog, setShowNewVariantPageDialog] = useState(false);
  const [newVariantPageName, setNewVariantPageName] = useState("");

  // content managers
  const principal = useContentManager({ lessonId });
  const variant = useContentManager({ lessonId, variantId: selectedVariant ?? undefined });

  useEffect(() => {
    if (lessonId) loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    if (variants && Array.isArray(variants)) {
      const defaultVariant = variants.find((v: LessonVariant) => v.isDefault);
      setSelectedVariant(prev => prev ?? (defaultVariant ? defaultVariant.id : variants[0]?.id ?? null));
    }
  }, [variants]);

  useEffect(() => {
    if (selectedVariant) setActiveTab(selectedVariant);
  }, [selectedVariant]);

  const loadLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`);
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

  const handleCreateVariant = async () => {
    if (!newVariantName.trim()) {
      toast.error("Nome da variante é obrigatório");
      return;
    }
    if (!newVariantSlug.trim()) {
      toast.error("Slug da variante é obrigatório");
      return;
    }
    setCreatingVariant(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVariantName,
          slug: newVariantSlug,
          description: newVariantDescription || undefined,
          isDefault: newVariantIsDefault || undefined,
          weight: newVariantWeight ?? undefined,
          isActive: newVariantIsActive || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar variante");
      }
      toast.success("Variante criada!");
      setShowNewVariantDialog(false);
      setNewVariantName("");
      setNewVariantSlug("");
      setNewVariantDescription("");
      setNewVariantIsDefault(false);
      setNewVariantWeight(100);
      setNewVariantIsActive(true);
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

  const Paragraph = () => (
    <>Edite o conteúdo da lição usando Markdown e LaTeX para criar conteúdo educacional rico.</>
  );

  if (principal.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  // Decide whether header "Nova Página" should create for principal or variant
  const isPrincipalActive = activeTab === "principal";
  const headerButtonDisabled = isPrincipalActive ? principal.saving : variant.saving;
  const headerButtonLabel = isPrincipalActive ? "Nova Página" : `Nova Página (Variante)`;

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

          <NewPageButton
            isPrincipalActive={isPrincipalActive}
            setShowNewPageDialog={setShowNewPageDialog}
            setShowNewVariantPageDialog={setShowNewVariantPageDialog}
            headerButtonDisabled={headerButtonDisabled}
            headerButtonLabel={headerButtonLabel}
          />
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
          newVariantSlug={newVariantSlug}
          setNewVariantSlug={setNewVariantSlug}
          newVariantDescription={newVariantDescription}
          setNewVariantDescription={setNewVariantDescription}
          newVariantIsDefault={newVariantIsDefault}
          setNewVariantIsDefault={setNewVariantIsDefault}
          newVariantWeight={newVariantWeight}
          setNewVariantWeight={setNewVariantWeight}
          newVariantIsActive={newVariantIsActive}
          setNewVariantIsActive={setNewVariantIsActive}
          creatingVariant={creatingVariant}
          handleCreateVariant={handleCreateVariant}
        >
          {/* Principal */}
          <TabsContent value="principal">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <LessonContentSidebar
                  contentPages={principal.contentPages}
                  selectedPage={principal.selectedPage}
                  onSelectPage={principal.selectPage}
                  pageOrder={principal.pageOrder}
                  onPageOrderChange={(o)=>{ principal.setPageOrder(o); principal.setPageOrderChanged(true); }}
                  pageOrderChanged={principal.pageOrderChanged}
                  onSavePageOrder={principal.savePageOrder}
                  blockOrder={principal.blockOrder}
                  onBlockOrderChange={(o)=>{ principal.setBlockOrder(o); principal.setBlockOrderChanged(true); }}
                  blockOrderChanged={principal.blockOrderChanged}
                  onSaveBlockOrder={principal.saveBlockOrder}
                  selectedBlock={principal.selectedBlock}
                  onSelectBlock={principal.selectBlock}
                  onCreateBlock={() => principal.createMarkdownBlock()}
                  saving={principal.saving}
                />
              </div>
              <div className="lg:col-span-3">
                <LessonContentEditor
                  selectedPage={principal.selectedPage}
                  selectedBlock={principal.selectedBlock}
                  markdown={principal.markdown}
                  setMarkdown={principal.setMarkdown}
                  saving={principal.saving}
                  handleSaveMarkdown={principal.saveMarkdown}
                />
              </div>
            </div>

            <CreatePageDialog
              open={showNewPageDialog}
              onOpenChange={(open) => {
                setShowNewPageDialog(open);
                if (!open) setNewPageName("");
              }}
              newPageName={newPageName}
              setNewPageName={setNewPageName}
              // onCreatePage is synchronous (returns void): call manager and then close dialog when done
              onCreatePage={() => {
                principal.createPage(newPageName)
                  .then(() => {
                    setShowNewPageDialog(false);
                    setNewPageName("");
                  })
                  .catch(() => { /* createPage shows toast on error */ });
              }}
              saving={principal.saving}
            />
          </TabsContent>

          {/* Variants */}
          {variants && variants.map((v: LessonVariant) => (
            <TabsContent key={v.id} value={v.id}>
              <div className="text-pink-700 font-semibold mb-4">Editando variante: {v.name}</div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <LessonContentSidebar
                    contentPages={variant.contentPages}
                    selectedPage={variant.selectedPage}
                    onSelectPage={variant.selectPage}
                    pageOrder={variant.pageOrder}
                    onPageOrderChange={(o)=>{ variant.setPageOrder(o); variant.setPageOrderChanged(true); }}
                    pageOrderChanged={variant.pageOrderChanged}
                    onSavePageOrder={variant.savePageOrder}
                    blockOrder={variant.blockOrder}
                    onBlockOrderChange={(o)=>{ variant.setBlockOrder(o); variant.setBlockOrderChanged(true); }}
                    blockOrderChanged={variant.blockOrderChanged}
                    onSaveBlockOrder={variant.saveBlockOrder}
                    selectedBlock={variant.selectedBlock}
                    onSelectBlock={variant.selectBlock}
                    onCreateBlock={() => variant.createMarkdownBlock()}
                    saving={variant.saving}
                  />

                  <NewPageButton
                    className="!bg-pink-900 !text-md mt-4"
                    isPrincipalActive={isPrincipalActive}
                    setShowNewPageDialog={setShowNewPageDialog}
                    setShowNewVariantPageDialog={setShowNewVariantPageDialog}
                    headerButtonDisabled={headerButtonDisabled}
                    headerButtonLabel={headerButtonLabel}
                  />
                </div>
                <div className="lg:col-span-3">
                  <LessonContentEditor
                    selectedPage={variant.selectedPage}
                    selectedBlock={variant.selectedBlock}
                    markdown={variant.markdown}
                    setMarkdown={variant.setMarkdown}
                    saving={variant.saving}
                    handleSaveMarkdown={variant.saveMarkdown}
                  />
                </div>
              </div>

              <CreatePageDialog
                open={showNewVariantPageDialog}
                onOpenChange={(open) => {
                  setShowNewVariantPageDialog(open);
                  if (!open) setNewVariantPageName("");
                }}
                newPageName={newVariantPageName}
                setNewPageName={setNewVariantPageName}
                onCreatePage={() => {
                  variant.createPage(newVariantPageName)
                    .then(() => {
                      setShowNewVariantPageDialog(false);
                      setNewVariantPageName("");
                    })
                    .catch(() => { /* handled by createPage */});
                }}
                saving={variant.saving}
              />
            </TabsContent>
          ))}
        </LessonVariantsTabs>
      </div>
    </>
  );
}
