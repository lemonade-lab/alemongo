import {useEffect, useState} from "react";
import FileEdit from "@/commom/FileEdit";
import Box from "@/commom/Box";
const Env = () => {
  const [data, setData] = useState<string>("");
  // 是否是创建配置
  const isCreate = window.location.pathname.includes("update");
  useEffect(() => {}, []);
  const onSave = (name: string, value: string) => {};
  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 transition-colors flex-1">
        <FileEdit
          disableName={!isCreate}
          onSave={onSave}
          name=".env"
          value={data}
        />
      </div>
    </Box>
  );
};

export default Env;
