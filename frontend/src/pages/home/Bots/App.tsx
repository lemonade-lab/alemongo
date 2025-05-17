import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Table from "./Table";
import {Button, Modal} from "antd";
import {useState} from "react";
import {Tabs} from "antd";
import type {TabsProps} from "antd";

/**
 * @returns
 */
const Home = () => {
  const installed = useSelector(
    (state: RootState) => state.info.node.installed
  );
  const [visible, setVisible] = useState(false);
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
    <>
      {installed ? (
        <Table
          onClick={(key) => {
            if (key === "node") {
              setVisible(true);
            }
          }}
        />
      ) : (
        <section className="flex-1 flex flex-col justify-center items-center bg-slate-100 dark:bg-zinc-900 transition-colors">
          <div className="flex flex-col gap-6 items-center">
            <div className="text-3xl text-gray-900 dark:text-gray-100">
              NodeJS 未安装，无法管理机器人
            </div>
            <Button
              onClick={() => setVisible(true)}
              className="bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
            >
              了解如何安装
            </Button>
          </div>
        </section>
      )}
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        title="安装 NodeJS"
      >
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </Modal>
    </>
  );
};

export default Home;
