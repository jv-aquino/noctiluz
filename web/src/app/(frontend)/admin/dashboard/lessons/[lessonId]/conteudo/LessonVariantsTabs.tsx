"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { generateSlug } from "@/utils";
import { slugSchema } from "@/backend/schemas";
import React from "react";
import { LessonVariant } from "@/generated/prisma";

interface LessonVariantsTabsProps {
  variants: LessonVariant[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedVariant: (id: string | null) => void;
  showNewVariantDialog: boolean;
  setShowNewVariantDialog: (open: boolean) => void;
  newVariantName: string;
  setNewVariantName: (name: string) => void;
  newVariantSlug: string;
  setNewVariantSlug: (slug: string) => void;
  newVariantDescription: string;
  setNewVariantDescription: (desc: string) => void;
  newVariantIsDefault: boolean;
  setNewVariantIsDefault: (val: boolean) => void;
  newVariantWeight: number;
  setNewVariantWeight: (val: number) => void;
  newVariantIsActive: boolean;
  setNewVariantIsActive: (val: boolean) => void;
  creatingVariant: boolean;
  handleCreateVariant: () => void;
  children: React.ReactNode;
}

export default function LessonVariantsTabs({
  variants,
  activeTab,
  setActiveTab,
  setSelectedVariant,
  showNewVariantDialog,
  setShowNewVariantDialog,
  newVariantName,
  setNewVariantName,
  newVariantSlug,
  setNewVariantSlug,
  newVariantDescription,
  setNewVariantDescription,
  newVariantIsDefault,
  setNewVariantIsDefault,
  newVariantWeight,
  setNewVariantWeight,
  newVariantIsActive,
  setNewVariantIsActive,
  creatingVariant,
  handleCreateVariant,
  children,
}: LessonVariantsTabsProps) {
  const isValidSlug = (slug: string) => slugSchema.safeParse(slug).success;

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex gap-2 items-center">
          <TabsTrigger value="principal">Principal</TabsTrigger>
          {variants && variants.map((variant) => (
            <TabsTrigger key={variant.id} value={variant.id} onClick={() => setSelectedVariant(variant.id)}>
              {variant.name} {variant.isDefault && <span className="text-xs text-pink-600">(default)</span>}
            </TabsTrigger>
          ))}
          <Button size="sm" variant="outline" onClick={() => setShowNewVariantDialog(true)} className="ml-2">
            <Plus className="w-4 h-4 mr-1" /> Nova Variante
          </Button>
        </TabsList>
        {children}
      </Tabs>
      <Dialog open={showNewVariantDialog} onOpenChange={setShowNewVariantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Variante</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Nome da variante"
                value={newVariantName}
                onChange={e => {
                  const value = e.target.value;
                  setNewVariantName(value);
                  if (!newVariantSlug) {
                    setNewVariantSlug(generateSlug(value));
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Slug</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="ex: minha-variante"
                value={newVariantSlug}
                onChange={e => setNewVariantSlug(generateSlug(e.target.value))}
              />
              {!isValidSlug(newVariantSlug) && newVariantSlug && (
                <p className="text-xs text-red-600">Slug deve conter apenas letras minúsculas, números e hífens.</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Descrição (opcional)"
                value={newVariantDescription}
                onChange={e => setNewVariantDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newVariantIsDefault}
                  onChange={e => setNewVariantIsDefault(e.target.checked)}
                />
                <span className="text-sm">Default</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newVariantIsActive}
                  onChange={e => setNewVariantIsActive(e.target.checked)}
                />
                <span className="text-sm">Ativa</span>
              </label>
              <div className="space-y-1">
                <label className="text-sm font-medium">Peso</label>
                <input
                  type="number"
                  min={0}
                  className="w-full p-2 border rounded"
                  value={Number.isFinite(newVariantWeight) ? newVariantWeight : 100}
                  onChange={e => {
                    const parsed = parseInt(e.target.value, 10);
                    setNewVariantWeight(Number.isNaN(parsed) ? 0 : parsed);
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVariantDialog(false)} disabled={creatingVariant}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVariant} disabled={
              creatingVariant || !newVariantName.trim() || !newVariantSlug.trim() || !isValidSlug(newVariantSlug)
            }>
              {creatingVariant ? 'Criando...' : 'Criar Variante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 