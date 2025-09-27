import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TagEditor from "@/components/common/TagEditor";
import { generateSlug } from "@/utils";
import type { Course } from "@/generated/prisma";
import RelatedSubjectsEditor from "@/components/table/RelatedSubjectsEditor";
import { MultiStepForm, type Step } from "@/components/ui/multi-step-form";
import FileUploadInput from "@/components/input/FileUpload";

type CourseFormData = Omit<Course, "id">;

interface CourseFormProps {
  editingCourse?: Course | null;
  onSubmit: (data: CourseFormData, relatedSubjects: string[]) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
  subjects: { id: string; name: string }[];
  initialRelatedSubjects?: string[];
}

const EMPTY_COURSE: CourseFormData = {
  name: "",
  description: "",
  slug: "",
  tags: [],
  backgroundImage: ""
};

export function CourseForm({
  editingCourse,
  onSubmit,
  onCancel,
  submitText = "Adicionar Curso →",
  subjects,
  initialRelatedSubjects = [],
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>(() => {
    if (editingCourse) {
      return {
        name: editingCourse.name,
        description: editingCourse.description,
        slug: editingCourse.slug,
        tags: editingCourse.tags || [],
        backgroundImage: editingCourse.backgroundImage
      };
    }
    return EMPTY_COURSE;
  });

  const [loading, setLoading] = useState(false);
  const [relatedSubjects, setRelatedSubjects] = useState<string[]>(
    initialRelatedSubjects
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
        !!formData.name.trim() && !!formData.description.trim() && !!formData.slug.trim(),
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
            <Label htmlFor="descrihandleDescriptionChangecao">Descrição*</Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
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
      id: "subjects",
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
            <Label className="text-sm font-medium">
              Imagem de fundo*
            </Label>
          </FileUploadInput>
          <RelatedSubjectsEditor
            subjects={subjects}
            selected={relatedSubjects}
            onChange={setRelatedSubjects}
          />
        </>
      ),
    },
  ];

  // Called when MultiStepForm finishes
  const handleComplete = async (data: CourseFormData) => {
    if (loading) return;
    setLoading(true);
    try {
      await onSubmit(data, relatedSubjects);
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

export default CourseForm;