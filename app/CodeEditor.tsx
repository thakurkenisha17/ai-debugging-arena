"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({
  code,
  language,
  onChange,
}: CodeEditorProps) {
  const editorLanguage =
    language === "Java"
      ? "java"
      : language === "Python"
        ? "python"
        : "cpp";

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <Editor
        height="350px"
        language={editorLanguage}
        value={code}
        onChange={(value) => onChange(value ?? "")}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          wordWrap: "on",
          tabSize: 4,
        }}
      />
    </div>
  );
}