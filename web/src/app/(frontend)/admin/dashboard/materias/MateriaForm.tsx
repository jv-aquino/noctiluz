'use client'
import { useState } from "react";
import { generateSlug } from "@/utils";
import toast from "react-hot-toast";
import FileUploadInput from "@/components/input/FileUpload";
import { MultiStepForm, type Step } from "@/components/ui/multi-step-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MateriaWithTopico } from "@/types";
import TagEditor from '@/components/common/TagEditor';

const EMPTY_MATERIA = {
  name: '',
  slug: '',
  cor: '#ffffff',
  descricao: '',
  imgUrl: '' as string,
  tags: [] as string[],
};

interface MateriaFormProps {
  editingMateria?: MateriaWithTopico | null;
  onSubmit: (data: typeof EMPTY_MATERIA) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
}

export function MateriaForm({ 
  editingMateria, 
  onSubmit, 
  onCancel, 
  submitText = "Adicionar Matéria →" 
}: MateriaFormProps) {
  const [formData, setFormData] = useState(() => {
    if (editingMateria) {
      return {
        name: editingMateria.name,
        slug: editingMateria.slug,
        cor: editingMateria.cor,
        descricao: editingMateria.descricao,
        imgUrl: editingMateria.imgUrl,
        tags: editingMateria.tags || [],
      };
    }
    return EMPTY_MATERIA;
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleFileUpload = (file: { url: string } | null) => {
    setFormData(prev => ({
      ...prev,
      imgUrl: file?.url || ''
    }));
  };

  const handleSubmit = async (data: typeof EMPTY_MATERIA) => {
    try {
      await onSubmit(data);
    } catch (error) {
      toast.error('Erro ao salvar matéria: ' + String(error));
      throw error; // Re-throw to let MultiStepForm handle the error state
    }
  };

  const steps: Step[] = [
    {
      id: 'basic-info',
      title: 'Informações Básicas',
      validation: () => !!(formData.name && formData.slug && formData.descricao),
      content: (
        <>
          {/* Nome da Matéria */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome da Matéria*
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Astronomia"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
              Descrição*
            </Label>
            <Input
              id="descricao"
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição da matéria"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
              Slug* <span className="text-xs text-gray-500">(fins de indexação no site)</span>
            </Label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="astronomia"
              className="w-full"
              required
            />
          </div>
        </>
      )
    },
    {
      id: 'appearance',
      title: 'Aparência',
      validation: () => !!formData.imgUrl,
      content: (
        <>
          <div className="space-y-2">
            <Label htmlFor="cor" className="text-sm font-medium text-gray-700">
              Cor da Matéria*
            </Label>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">#</span>
                <Input
                  id="cor"
                  type="text"
                  value={formData.cor.replace('#', '')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cor: '#' + e.target.value.replace('#', '') 
                  }))}
                  className="w-20 text-center"
                  maxLength={6}
                  pattern="[0-9A-Fa-f]{6}"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <FileUploadInput
            arquivo={formData.imgUrl ? { name: formData.imgUrl.split('/').pop() || '', url: formData.imgUrl } : null}
            handleFileUpload={handleFileUpload}
            accept=".svg,.webp,.avif,.png,.jpg,.jpeg"
            maxSize={5}
          >
            <Label className="text-sm font-medium text-gray-700">
              Ícone/Logo* <span className="text-xs text-gray-500">(já com a cor, preferir svg ou webp/avif)</span>
            </Label>
          </FileUploadInput>
        </>
      )
    },
    {
      id: 'tags',
      title: 'Tags',
      validation: () => true,
      content: (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Tags</Label>
          <TagEditor
            tags={formData.tags}
            onChange={tags => setFormData(prev => ({ ...prev, tags }))}
          />
        </div>
      )
    }
  ];

  return (
    <MultiStepForm
      steps={steps}
      onComplete={handleSubmit}
      onCancel={onCancel}
      submitText={submitText}
      cancelText="Cancelar"
      continueText="Continuar"
      backText="Voltar"
      initialData={formData}
    />
  );
} 