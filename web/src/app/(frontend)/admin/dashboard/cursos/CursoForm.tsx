import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TagEditor from "@/components/common/TagEditor";
import { generateSlug } from "@/utils";
import type { Curso } from "@/generated/prisma";
import RelatedMateriasEditor from "@/components/table/RelatedMateriasEditor";
import { MultiStepForm, type Step } from "@/components/ui/multi-step-form";
import FileUploadInput from "@/components/input/FileUpload";

type CursoFormData = Omit<Curso, "id">;

interface CursoFormProps {
  editingCurso?: Curso | null;
  onSubmit: (data: CursoFormData, relatedMaterias: string[]) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
  materias: { id: string; name: string }[];
  initialRelatedMaterias?: string[];
}

const EMPTY_CURSO: CursoFormData = {
  name: "",
  descricao: "",
  slug: "",
  tags: [],
  backgroundImage: ""
};

export function CursoForm({
  editingCurso,
  onSubmit,
  onCancel,
  submitText = "Adicionar Curso →",
  materias,
  initialRelatedMaterias = [],
}: CursoFormProps) {
  const [formData, setFormData] = useState<CursoFormData>(() => {
    if (editingCurso) {
      return {
        name: editingCurso.name,
        descricao: editingCurso.descricao,
        slug: editingCurso.slug,
        tags: editingCurso.tags || [],
        backgroundImage: editingCurso.backgroundImage
      };
    }
    return EMPTY_CURSO;
  });

  const [loading, setLoading] = useState(false);
  const [relatedMaterias, setRelatedMaterias] = useState<string[]>(
    initialRelatedMaterias
  );

  // Handlers
  const handleFileUpload = (file: { url: string } | null) => {
    setFormData(prev => ({
      ...prev,
      backgroundImage: file?.url || ''
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const descricao = e.target.value;
    setFormData((prev) => ({ ...prev, descricao }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData((prev) => ({ ...prev, tags }));
  };

  // Steps for MultiStepForm
  const steps: Step[] = [
    {
      id: "basic",
      title: "Informações do Curso",
      validation: () =>
        !!formData.name.trim() && !!formData.descricao.trim() && !!formData.slug.trim(),
      content: (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Curso*</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Curso de Astronomia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição*</Label>
            <Input
              id="descricao"
              type="text"
              value={formData.descricao}
              onChange={handleDescricaoChange}
              placeholder="Descrição do curso"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug*</Label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="curso-de-astronomia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagEditor tags={formData.tags} onChange={handleTagsChange} />
          </div>
        </>
      ),
    },
    {
      id: "materias",
      title: "Matérias Relacionadas",
      validation: () => true, // no strict validation on this step
      content: (
        <>
          <FileUploadInput
            arquivo={formData.backgroundImage ? { name: formData.backgroundImage.split('/').pop() || '', url: formData.backgroundImage } : null}
            handleFileUpload={handleFileUpload}
            accept=".svg,.webp,.avif,.png,.jpg,.jpeg"
            maxSize={5}
            folder="cursos"
          >
            <Label className="text-sm font-medium text-gray-700">
              Imagem de fundo*
            </Label>
          </FileUploadInput>
          <RelatedMateriasEditor
            materias={materias}
            selected={relatedMaterias}
            onChange={setRelatedMaterias}
          />
        </>
      ),
    },
  ];

  // Called when MultiStepForm finishes
  const handleComplete = async (data: CursoFormData) => {
    if (loading) return;
    setLoading(true);
    try {
      await onSubmit(data, relatedMaterias);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MultiStepForm
      steps={steps}
      onComplete={handleComplete}
      onCancel={onCancel}
      submitText={submitText}
      cancelText="Cancelar"
      continueText="Continuar"
      backText="Voltar"
      initialData={formData}
      className="space-y-4"
    />
  );
}

export default CursoForm;