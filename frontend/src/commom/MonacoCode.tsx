import MonacoEditor from "@monaco-editor/react";

export default function MonacoCode({
  value,
  onChange,
  height = 300,
  language = "json",
}: {
  value: string;
  onChange?: (value: string) => void;
  height?: number | string;
  language?: "json" | "yaml";
}) {
  return (
    <MonacoEditor
      className="min-h-full"
      width="100%"
      height={height}
      defaultLanguage={language}
      language={language}
      value={value}
      options={{
        lineNumbers: "on",
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      onChange={(val) => onChange?.(val ?? "")}
    />
  );
}