import {Button, Input} from "antd";
import {useEffect, useState} from "react";
import Code from "@/commom/CodeMirror";

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

  useEffect(() => {
    setFileData(value || "");
    if (name) {
      setInputValue(name);
    }
  }, [name, value]);

  const handleCodeChange = (_editor: unknown, _data: unknown, val: string) => {
    setFileData(val);
  };

  const handleSave = () => {
    onSave(inputValue, fileData);
  };

  return (
    <div className="flex flex-1 flex-col  gap-2">
      <div className="flex-1 flex flex-col rounded-md bg-white">
        {
          <div className="flex items-center justify-between p-1 bg-slate-400 rounded-t-md">
            <div>
              {disableName && <div className="px-2">{name}</div>}
              {!disableName && (
                <Input value={inputValue || ""} placeholder="name" />
              )}
            </div>
            <Button onClick={handleSave}>保存</Button>
          </div>
        }
        <div className="flex overflow-auto flex-1 max-h-[120vh] xl:max-h-none">
          <div className="flex-1 flex w-[100px]">
            {<Code mode="text" value={fileData} onChange={handleCodeChange} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEdit;
