import {Button} from "antd";
import {CopyOutlined} from "@ant-design/icons";

// 生成结果组件
const OutputSection = ({
  output,
  onCopy,
}: {
  output: string;
  onCopy: () => void;
}) => {
  return (
    <div className="flex-1 flex flex-col  bg-white rounded-md ">
      <div className="flex justify-end items-center p-2">
        <div className="flex gap-4">
          <Button id="copyButton" onClick={onCopy} type="primary">
            <CopyOutlined />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex  shadow-inner overflow-auto">
        <textarea
          className="min-h-60 flex-1 outline-none resize-none border-t rounded-b-md"
          value={output}
          readOnly
        />
      </div>
    </div>
  );
};

export default OutputSection;
