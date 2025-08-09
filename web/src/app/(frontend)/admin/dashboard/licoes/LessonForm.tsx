import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lesson } from '@/generated/prisma';
import { MultiStepForm, type Step } from '@/components/ui/multi-step-form';
import toast from 'react-hot-toast';

type LessonFormData = Omit<Lesson, 'id'>;

interface LessonFormProps {
  editingLesson?: Lesson | null;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
  loading?: boolean;
}

const EMPTY_LESSON: LessonFormData = {
  name: '',
  identifier: "",
  descricao: '',
  type: 'GERAL',
  difficulty: 2.5,
  estimatedDuration: 5,
  knowledgeComponents: [],
  prerequisites: [],
  archived: false,
};

export function LessonForm({ 
  editingLesson, 
  onSubmit, 
  onCancel, 
  submitText = "Adicionar Lição →",
  loading = false 
}: LessonFormProps) {
  const [formData, setFormData] = useState<LessonFormData>(
    editingLesson ? { ...editingLesson } : { ...EMPTY_LESSON }
  );
  const [knowledgeComponent, setKnowledgeComponent] = useState('');
  const [prerequisite, setPrerequisite] = useState('');

  // Handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, identifier: e.target.value }));
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, descricao: e.target.value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, type: e.target.value as LessonFormData['type'] }));
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 5) {
      setFormData(prev => ({ ...prev, difficulty: value }));
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFormData(prev => ({ ...prev, estimatedDuration: value }));
    }
  };

  const addKnowledgeComponent = () => {
    if (knowledgeComponent.trim() && !formData.knowledgeComponents.includes(knowledgeComponent.trim())) {
      setFormData(prev => ({
        ...prev,
        knowledgeComponents: [...prev.knowledgeComponents, knowledgeComponent.trim()]
      }));
      setKnowledgeComponent('');
    }
  };

  const removeKnowledgeComponent = (component: string) => {
    setFormData(prev => ({
      ...prev,
      knowledgeComponents: prev.knowledgeComponents.filter(c => c !== component)
    }));
  };

  const addPrerequisite = () => {
    if (prerequisite.trim() && !formData.prerequisites.includes(prerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisite.trim()]
      }));
      setPrerequisite('');
    }
  };

  const removePrerequisite = (prereq: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prereq)
    }));
  };

  const steps: Step[] = [
    {
      id: 'basic-info',
      title: 'Informações Básicas',
      validation: () => !!formData.name.trim() && !!formData.identifier.trim(),
      content: (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Lição *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Ex: Introdução à Álgebra"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identifier">Identificador *</Label>
            <Input
              id="identifier"
              value={formData.identifier}
              onChange={handleIdentifierChange}
              placeholder="Ex: algebra_intro"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={handleDescricaoChange}
              placeholder="Breve descrição da lição"
            />
          </div>
        </>
      )
    },
    {
      id: 'details',
      title: 'Detalhes da Lição',
      validation: () => formData.difficulty >= 0 && formData.difficulty <= 5 && formData.estimatedDuration > 0,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={formData.type}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="GERAL">Geral</option>
              <option value="EXERCICIOS">Exercícios</option>
              <option value="REVISAO">Revisão</option>
              <option value="SIMULACAO">Simulação</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade (0-5)</Label>
            <Input
              id="difficulty"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.difficulty}
              onChange={handleDifficultyChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duração Estimada (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.estimatedDuration ?? ''}
              onChange={handleDurationChange}
            />
          </div>
        </div>
      )
    },
    {
      id: 'knowledge-prerequisites',
      title: 'Componentes e Pré-requisitos',
      validation: () => true,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Componentes de Conhecimento</Label>
            <div className="flex gap-2">
              <Input
                value={knowledgeComponent}
                onChange={(e) => setKnowledgeComponent(e.target.value)}
                placeholder="Ex: algebra_basics"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKnowledgeComponent())}
              />
              <Button type="button" onClick={addKnowledgeComponent} variant="outline">
                Adicionar
              </Button>
            </div>
            {formData.knowledgeComponents.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.knowledgeComponents.map((component, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {component}
                    <button
                      type="button"
                      onClick={() => removeKnowledgeComponent(component)}
                      className="text-pink-600 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Pré-requisitos</Label>
            <div className="flex gap-2">
              <Input
                value={prerequisite}
                onChange={(e) => setPrerequisite(e.target.value)}
                placeholder="Ex: matematica_basica"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              />
              <Button type="button" onClick={addPrerequisite} variant="outline">
                Adicionar
              </Button>
            </div>
            {formData.prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.prerequisites.map((prereq, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {prereq}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(prereq)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  
  const handleSubmit = async (data: typeof EMPTY_LESSON) => {
    if (loading) {
      return;
    }
    try {
      await onSubmit(data);
    } catch (error) {
      toast.error('Erro ao salvar matéria: ' + String(error));
      throw error; // Re-throw to let MultiStepForm handle the error state
    }
  };

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
      className="space-y-6"
    />
  );
}