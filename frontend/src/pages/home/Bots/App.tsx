import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Headings from "./Headings";
import Table from "./Table";
import {Button, Modal} from "antd";
import {useEffect, useState} from "react";
import {Tabs} from "antd";
import type {TabsProps} from "antd";

/**
 * 强制刷新 hook
 */
const useForceUpdate = (): [boolean, () => void] => {
  const [value, setValue] = useState(true);
  useEffect(() => {
    if (!value) {
      setValue(true);
    }
  }, [value]);
  const onForceUpdate = () => {
    setValue(false);
  };
  return [value, onForceUpdate];
};

/**
 *
 * @returns
 */
const Home = () => {
  const installed = useSelector(
    (state: RootState) => state.info.node.installed
  );
  const [visible, setVisible] = useState(false);
  const [value, onForceUpdate] = useForceUpdate();

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
      <Headings
        onUpdate={() => onForceUpdate()}
        onClick={(key) => {
          // console.log(key);
          if (key === "node") {
            setVisible(true);
          }
        }}
      />
      {installed && value ? (
        <Table />
      ) : (
        <section className="flex-1 flex flex-col justify-center items-center">
          <div className="flex flex-col gap-6 items-center">
            <div className="text-3xl">NodeJS 未安装，无法管理机器人</div>
            <Button onClick={() => setVisible(true)}>了解如何安装</Button>
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
