import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Headings from "./Headings";
import Table from "./Table";
import {Button, Modal} from "antd";
import {useEffect, useState} from "react";
import {Tabs} from "antd";
import type {TabsProps} from "antd";
import {apiIdentityList} from "@/api/users/identity";

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
const Account = () => {
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
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "macos",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "windows",
      children: "Content of Tab Pane 3",
    },
  ];

  const [selects, setSelects] = useState<string[]>([]);
  useEffect(() => {
    const getList = async () => {
      const data = await apiIdentityList();
      setSelects(data);
    };
    getList();
  }, []);

  return (
    <>
      <Headings selects={selects} onUpdate={() => onForceUpdate()} />
      {installed && value ? (
        <Table selects={selects} />
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

export default Account;
