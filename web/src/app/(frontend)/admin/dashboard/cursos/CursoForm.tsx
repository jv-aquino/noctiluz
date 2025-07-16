import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TagEditor from '@/components/common/TagEditor';
import { generateSlug } from '@/utils';
import type { Curso } from '@/generated/prisma';
import RelatedMateriasEditor from '@/components/table/RelatedMateriasEditor';

type CursoFormData = Omit<Curso, 'id'>;

interface CursoFormProps {
  editingCurso?: Curso | null;
  onSubmit: (data: CursoFormData, relatedMaterias: string[]) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
  materias: { id: string; name: string }[];
  initialRelatedMaterias?: string[];
}

const EMPTY_CURSO: CursoFormData = {
  name: '',
  descricao: '',
  slug: '',
  tags: [],
};

export function CursoForm({ editingCurso, onSubmit, onCancel, submitText = "Adicionar Curso →", materias, initialRelatedMaterias = [] }: CursoFormProps) {
  const [formData, setFormData] = useState<CursoFormData>(() => {
    if (editingCurso) {
      return {
        name: editingCurso.name,
        descricao: editingCurso.descricao,
        slug: editingCurso.slug,
        tags: editingCurso.tags || [],
      };
    }
    return EMPTY_CURSO;
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [relatedMaterias, setRelatedMaterias] = useState<string[]>(initialRelatedMaterias);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.descricao || !formData.slug) {
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData, relatedMaterias);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 && (
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
              onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
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
              onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="curso-de-astronomia"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagEditor
              tags={formData.tags}
              onChange={tags => setFormData(prev => ({ ...prev, tags }))}
            />
          </div>
        </>
      )}
      {step === 2 && (
        <RelatedMateriasEditor
          materias={materias}
          selected={relatedMaterias}
          onChange={setRelatedMaterias}
        />
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        {step === 2 && (
          <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={loading}>
            Voltar
          </Button>
        )}
        <Button type="submit" disabled={loading || !formData.name || !formData.descricao || !formData.slug}>
          {step === 1 ? "Continuar" : submitText}
        </Button>
      </div>
    </form>
  );
}

export default CursoForm; 