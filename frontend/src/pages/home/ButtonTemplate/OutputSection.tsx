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
    <div className="flex-1 flex flex-col p-1 bg-gray-100 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">生成结果</h2>
        <div className="flex gap-4">
          <Button id="copyButton" onClick={onCopy} type="primary">
            <CopyOutlined />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex bg-white shadow-inner overflow-auto">
        <textarea className="min-h-60 flex-1" value={output} readOnly />
      </div>
    </div>
  );
};

export default OutputSection;
