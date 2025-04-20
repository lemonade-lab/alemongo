import {Button, Tooltip} from "antd";
import {CloseCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {DataButton} from "./types";

// 按钮行组件
const ButtonRow = ({
  rowId,
  buttons,
  onAddButton,
  onDeleteRow,
  onEditButton,
  onDeleteButton,
}: {
  rowId: number;
  buttons: DataButton[];
  onAddButton: (rowId: number) => void;
  onDeleteRow: (rowId: number) => void;
  onEditButton: (rowId: number, buttonId: string) => void;
  onDeleteButton: (rowId: number, buttonId: string) => void;
}) => {
  return (
    <div className="flex w-full flex-1 justify-between items-center gap-2 ">
      <div className="flex w-full max-w-60 flex-wrap gap-2 p-1 bg-white ">
        {buttons.map((button) => (
          <div
            key={button.id}
            className="ellipsis flex-1 relative flex items-center gap-2"
          >
            {
              // 根据类型渲染不同的按钮
              button.render_data.style === 1 ? (
                <Button
                  type="primary"
                  className="bg-blue-500 w-full"
                  onClick={() => onEditButton(rowId, button.id)}
                >
                  {button.render_data.label}
                </Button>
              ) : (
                <Button
                  type="default"
                  className="w-full"
                  onClick={() => onEditButton(rowId, button.id)}
                >
                  {button.render_data.label}
                </Button>
              )
            }
            <Tooltip title="删除当前按钮">
              <div
                className="absolute -top-1 right-0 z-10 cursor-pointer text-gray-500"
                onClick={() => onDeleteButton(rowId, button.id)}
              >
                X
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
      <div className="justify-end p-1 items-center flex gap-2">
        <Tooltip title="添加当前行按钮">
          <Button type="primary" onClick={() => onAddButton(rowId)}>
            <PlusCircleOutlined />
          </Button>
        </Tooltip>
        <Tooltip title="删除当前行">
          <Button
            type="primary"
            className="bg-red-500 hover:bg-red-600"
            onClick={() => onDeleteRow(rowId)}
          >
            <CloseCircleOutlined />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ButtonRow;
