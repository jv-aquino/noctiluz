'use client'
import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useMemo } from "react";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Dynamic import for SSR compatibility
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const remarkPlugins = useMemo(() => [remarkMath], []);
  const rehypePlugins = useMemo(() => [rehypeKatex], []);

  // Adapter for onChange to always provide a string
  const handleChange = (val?: string) => {
    onChange(val ?? "");
  };

  return (
    <div className="markdown-editor-container" data-color-mode="light">
      <style jsx>{`
        .markdown-editor-container {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        /* Custom LaTeX styling */
        .markdown-editor-container :global(.katex) {
          font-size: 1.1em;
          color: #374151;
        }
        
        .markdown-editor-container :global(.katex-display) {
          margin: 1em 0;
          text-align: center;
          background: #f9fafb;
          padding: 1em;
          border-radius: 6px;
          border-left: 4px solid #ec4899;
        }
        
        .markdown-editor-container :global(.katex-display .katex) {
          font-size: 1.2em;
        }
        
        /* Inline math styling */
        .markdown-editor-container :global(.katex:not(.katex-display)) {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
      `}</style>
      <MDEditor
        value={value}
        onChange={handleChange}
        previewOptions={{
          remarkPlugins,
          rehypePlugins,
        }}
        height={400}
        preview="live"
      />
    </div>
  );
} 