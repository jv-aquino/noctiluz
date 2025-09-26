"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateSlug } from "@/utils";
import React from "react";

interface SubjectOption {
  id: string;
  name: string;
}

interface TopicFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: SubjectOption[];
  onSubmit: (data: { name: string; description: string; slug: string; subjectId: string }) => Promise<void>;
  loading?: boolean;
}

export default function TopicForm({ open, onOpenChange, subjects, onSubmit, loading }: TopicFormProps) {
  const emptyFormdata = {
    name: "",
    description: "",
    slug: "",
    subjectId: subjects[0]?.id || "",
  }

  const [formData, setFormData] = useState(emptyFormdata);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, subjectId: subjects[0]?.id || "" }));
     
  }, [subjects]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData(emptyFormdata);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Adicionar Tópico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Tópico*</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Nome do tópico"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição*</Label>
            <Input
              id="descricao"
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do tópico"
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
              placeholder="slug-do-topico"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectId">Matéria*</Label>
            <select
              id="subjectId"
              className="w-full p-2 border rounded"
              value={formData.subjectId}
              onChange={e => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
              required
            >
              {subjects.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting || loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || loading || !formData.name || !formData.description || !formData.slug || !formData.subjectId}>
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 