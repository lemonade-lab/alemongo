import {useState} from "react";
import {apiBotCreate} from "../../../api";
import {Button, Form, Input, message} from "antd";
// import {useSelector} from "react-redux";
// import {RootState} from "../../../redux";
import {Modal} from "antd";
import { useCommon } from "@/hook/useCommon";

const Headings = ({
  onUpdate,
  onClick,
}: {
  onUpdate: () => void;
  onClick?: (key: string) => void;
}) => {
  const [visible, setVisible] = useState(false);
  // const info = useSelector((state: RootState) => state.info);
  const [common] = useCommon();
  const info = common.info;
  /**
   * @param e
   * @returns
   */
  const onSubmit = (values: HTMLFormElement) => {
    // fetch data
    const name = values.botname;
    // 英文，数字，下划线
    const reg = /^[a-zA-Z0-9_]+$/;
    if (!reg.test(name)) {
      message.error("机器人名称只能包含英文，数字，下划线");
      return;
    }
    apiBotCreate({
      name,
    }).then(() => {
      setVisible(false);
      onUpdate();
    });
  };
  const minVersion = 20;
  const [form] = Form.useForm();
  return (
    <header className="flex justify-between items-center gap-2 py-2">
      <div className="flex-1 flex gap-2 flex-col lg:flex-row">
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="mr-1.5 size-5 shrink-0 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z"
              clipRule="evenodd"
            />
            <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
          </svg>
          NodeJS {info.node.installed ? info.node.version : "未安装"}
          {info.node.installed &&
            parseInt(info.node.version.split("v")[1].split(".")[0]) <
              minVersion && (
              <span
                className="ml-2 text-red-500 border px-1 rounded-md cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) {
                    onClick("node");
                  }
                }}
              >
                版本过低，可能出现依赖错误
              </span>
            )}
        </div>
        {/* <div className="flex items-center text-sm text-gray-500">
          <svg
            className="mr-1.5 size-5 shrink-0 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
              clipRule="evenodd"
            />
          </svg>
          {info.location}
        </div> */}
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="mr-1.5 size-5 shrink-0 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
              clipRule="evenodd"
            />
          </svg>
          {info.start_at}
        </div>
      </div>
      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
        }}
      >
        新建
      </Button>
      <Modal
        open={visible}
        title="创建机器人"
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <Form form={form} onFinish={onSubmit}>
          <Form.Item name="botname">
            <Input placeholder="请输入机器人名称"></Input>
          </Form.Item>
        </Form>
      </Modal>
    </header>
  );
};

export default Headings;
