"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import LessonsList from "./LessonsList";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TopicoItem({ topico, onDelete }: { topico: any; onDelete: (topico: any) => void }) {
  return (
    <div className="p-2 rounded-lg border">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={topico.id} className="border-b-0">
          <div className="flex items-center justify-between w-full">
            <AccordionTrigger className="flex-grow p-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full mr-2 border"
                  style={{ backgroundColor: topico.materia?.cor || '#eee' }}
                />
                <span className="font-medium">{topico.name}</span>
              </div>
            </AccordionTrigger>
            <div onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} className="pr-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(topico)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
          </div>
          <AccordionContent className="p-4 pt-2 rounded-b-lg">
            <LessonsList topicoId={topico.id} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 