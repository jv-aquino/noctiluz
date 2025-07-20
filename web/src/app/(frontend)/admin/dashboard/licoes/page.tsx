"use client";
import { useState } from "react";
import AdminHeader from "../components/header/AdminHeader";
import { BookCopy } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import LatexExamples from "./LatexExamples";

export default function LicoesPage() {
  const [markdown, setMarkdown] = useState<string>("");

  const Paragraph = () => (
    <>Crie e edite lições com Markdown, LaTeX e imagens. (Funcionalidade inicial de edição e preview)</>
  );

  return (
    <>
      <AdminHeader Icon={BookCopy} Paragraph={Paragraph} title="Lições" />
      <div className="w-full mx-2 mt-8 bg-white border border-gray-400 p-6 rounded shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Editor de Lição</h2>
        <LatexExamples />
        <MarkdownEditor value={markdown} onChange={setMarkdown} />
      </div>
    </>
  );
} 