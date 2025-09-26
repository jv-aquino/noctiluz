"use client";
import React from "react";
import { Button } from "@/components/ui/button";

interface CreatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPageName: string;
  setNewPageName: (name: string) => void;
  onCreatePage: () => void;
  saving: boolean;
}

export default function CreatePageDialog({
  open,
  onOpenChange,
  newPageName,
  setNewPageName,
  onCreatePage,
  saving,
}: CreatePageDialogProps) {
  return (
    open ? (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="z-60 w-full h-full bg-pink-950 opacity-50 absolute"></div>
        <div className="bg-white rounded-lg p-6 w-96 z-70">
          <h3 className="text-lg font-semibold mb-4">Criar Nova Página</h3>
          <input
            type="text"
            placeholder="Nome da página"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            onKeyPress={(e) => e.key === 'Enter' && onCreatePage()}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setNewPageName("");
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={onCreatePage}
              disabled={saving || !newPageName.trim()}
            >
              {saving ? 'Criando...' : 'Criar Página'}
            </Button>
          </div>
        </div>
      </div>
    ) : null
  );
} 