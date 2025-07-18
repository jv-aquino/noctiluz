"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateSlug } from "@/utils";
import React from "react";

interface MateriaOption {
  id: string;
  name: string;
}

interface TopicoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materias: MateriaOption[];
  onSubmit: (data: { name: string; descricao: string; slug: string; materiaId: string }) => Promise<void>;
  loading?: boolean;
}

export default function TopicoForm({ open, onOpenChange, materias, onSubmit, loading }: TopicoFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    descricao: "",
    slug: "",
    materiaId: materias[0]?.id || "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, materiaId: materias[0]?.id || "" }));
     
  }, [materias]);

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
      setFormData({ name: "", descricao: "", slug: "", materiaId: materias[0]?.id || "" });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Adicionar Tópico</DialogTitle>
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
              value={formData.descricao}
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
            <Label htmlFor="materiaId">Matéria*</Label>
            <select
              id="materiaId"
              className="w-full p-2 border rounded"
              value={formData.materiaId}
              onChange={e => setFormData(prev => ({ ...prev, materiaId: e.target.value }))}
              required
            >
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting || loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || loading || !formData.name || !formData.descricao || !formData.slug || !formData.materiaId}>
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 