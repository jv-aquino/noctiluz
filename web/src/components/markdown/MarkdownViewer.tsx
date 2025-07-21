"use client";
import React from "react";
import ReactMarkdown from "react-markdown";

export default function MarkdownViewer({ markdown }: { markdown: string }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
} 