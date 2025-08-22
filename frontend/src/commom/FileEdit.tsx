import {Button, Input, message} from "antd";
import {useEffect, useState} from "react";
import MonacoEditor from "@monaco-editor/react"; // 假设你已安装 monaco-editor，统一与 JSONEdit 的体验
import useCodeTheme from "@/hook/useCodeTheme";

const FileEdit = ({
  name,
  value,
  onSave,
  disableName = false,
}: {
  name?: string;
  value: string;
  onSave: (name: string, value: string) => void;
  disableName?: boolean;
}) => {
  const [fileData, setFileData] = useState<string>(value || "");
  const [inputValue, setInputValue] = useState<string>(name || "");
  const theme = useCodeTheme();

  useEffect(() => {
    setFileData(value || "");
    if (name) {
      setInputValue(name);
    }
  }, [name, value]);

  const handleCodeChange = (val: string | undefined) => {
    setFileData(val ?? "");
  };

  const handleSave = () => {
    if (!inputValue) {
      message.error("文件名不能为空");
      return;
    }
    onSave(inputValue, fileData);
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex-1 flex flex-col rounded-md bg-white dark:bg-zinc-900 transition-colors">
        <div className="flex items-center justify-between p-1 bg-slate-400 dark:bg-zinc-800 rounded-t-md">
          <div>
            {disableName ? (
              <div className="px-2 dark:text-white min-w-[120px]">{name}</div>
            ) : (
              <Input
                value={inputValue}
                placeholder="文件名"
                allowClear
                onChange={(e) => setInputValue(e.target.value)}
                style={{minWidth: 120}}
              />
            )}
          </div>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
        <div className="flex overflow-auto flex-1 max-h-[120vh] xl:max-h-none">
          <div className="flex-1 flex w-full dark:text-white">
            <MonacoEditor
              value={fileData}
              language="plaintext"
              width="100%"
              height="100%"
              theme={theme}
              options={{
                fontSize: 14,
                lineNumbers: "on",
                minimap: {enabled: false},
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "off",
                formatOnPaste: false,
                formatOnType: false,
              }}
              onChange={handleCodeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEdit;
