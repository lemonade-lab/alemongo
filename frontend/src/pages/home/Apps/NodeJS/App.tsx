import React from "react";
import Box from "@/commom/Box";
import {Tabs, TabsProps} from "antd";

/**
 * @returns
 */
const AppsNodeJS: React.FC = () => {
  const onChange = (key: string) => {
    console.log(key);
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "linux",
      children: (
        <div className="flex gap-4">
          请访问
          <a
            href="https://lvyjs.dev/docs/environment"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://lvyjs.dev/docs/environment
          </a>
        </div>
      ),
    },
    {
      key: "2",
      label: "macos",
      children: (
        <div className="flex gap-4">
          请访问
          <a
            href="https://lvyjs.dev/docs/environment"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://lvyjs.dev/docs/environment
          </a>
        </div>
      ),
    },
    {
      key: "3",
      label: "windows",
      children: (
        <div className="flex gap-4">
          请访问
          <a
            href="https://lvyjs.dev/docs/environment"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://lvyjs.dev/docs/environment
          </a>
        </div>
      ),
    },
  ];
  return (
    <Box>
      <div className="p-2 flex-1 dark:bg-zinc-900 bg-white transition-colors min-h-[300px]">
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </div>
    </Box>
  );
};

export default AppsNodeJS;
