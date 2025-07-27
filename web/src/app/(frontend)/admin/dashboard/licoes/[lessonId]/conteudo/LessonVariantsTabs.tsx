"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  newVariantDescription: string;
  setNewVariantDescription: (desc: string) => void;
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
  newVariantDescription,
  setNewVariantDescription,
  creatingVariant,
  handleCreateVariant,
  children,
}: LessonVariantsTabsProps) {
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
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Nome da variante"
              value={newVariantName}
              onChange={e => setNewVariantName(e.target.value)}
              autoFocus
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Descrição (opcional)"
              value={newVariantDescription}
              onChange={e => setNewVariantDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVariantDialog(false)} disabled={creatingVariant}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVariant} disabled={creatingVariant || !newVariantName.trim()}>
              {creatingVariant ? 'Criando...' : 'Criar Variante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 