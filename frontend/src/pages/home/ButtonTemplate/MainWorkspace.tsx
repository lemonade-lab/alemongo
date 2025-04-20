import {Button, Tooltip} from "antd";
import {PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {DataRow} from "./types";
import ButtonRow from "./ButtonRow";

// 工作台组件
const MainWorkspace = ({
  rows,
  onUpLoad,
  onAddRow,
  onDeleteRow,
  onAddButton,
  onEditButton,
  onDeleteButton,
}: {
  rows: DataRow[];
  onUpLoad: () => void;
  onAddRow: () => void;
  onDeleteRow: (rowId: number) => void;
  onAddButton: (rowId: number) => void;
  onEditButton: (rowId: number, buttonId: string) => void;
  onDeleteButton: (rowId: number, buttonId: string) => void;
}) => {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">工作台</h2>
        <div className="flex gap-2">
          <Tooltip title="上传模板">
            <Button onClick={onUpLoad} type="primary">
              <UploadOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="添加新行">
            <Button onClick={onAddRow} type="primary">
              <PlusOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col">
        {rows.map((row) => (
          <ButtonRow
            key={row.id}
            rowId={row.id}
            buttons={row.buttons}
            onAddButton={onAddButton}
            onDeleteRow={onDeleteRow}
            onEditButton={onEditButton}
            onDeleteButton={onDeleteButton}
          />
        ))}
      </div>
    </div>
  );
};

export default MainWorkspace;
