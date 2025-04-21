import {message, Modal} from "antd";
import React, {useCallback, useEffect, useState} from "react";
import {DataRow, EditFormValues} from "./types";
import OutputSection from "./OutputSection";
import MainWorkspace from "./MainWorkspace";
import LoadForm from "./LoadFrom";
import EditForm from "./EditForm";
import {QQ_TEMPLATE_KEY} from "../../../api/base";
import {useForm} from "antd/es/form/Form";
import "./index.css";

/**
 * @returns
 */
const ButtonTemplate: React.FC = () => {
  const [rows, setRows] = useState<DataRow[]>([]);
  const [output, setOutput] = useState<string>("");

  // 添加行
  const addRow = () => {
    if (rows.length >= 5) {
      message.info("最多支持5行按钮");
      return;
    }
    const newRow: DataRow = {id: Date.now(), buttons: []};
    setRows([...rows, newRow]);
  };

  // 删除行
  const deleteRow = (rowId: number) => {
    const currentRow = rows.filter((row) => row.id !== rowId);
    setRows(currentRow);
  };

  // 创建按钮数据
  const createButtonData = () => {
    return {
      id: Date.now().toString(),
      render_data: {
        label: "文字",
        visited_label: "已点击",
        style: 0,
      },
      action: {
        type: 2,
        permission: {
          type: 2,
          specify_role_ids: ["1", "2", "3"],
        },
        click_limit: 10,
        unsupport_tips: "不支持",
        data: "",
        at_bot_show_channel_list: false,
        enter: false,
      },
    };
  };

  // 添加按钮
  const addButtonToRow = (rowId: number) => {
    const row = rows.find((row) => row.id === rowId);
    if (row && row.buttons.length >= 5) {
      message.info("每行最多支持5个按钮");
      return;
    }
    setRows(
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              buttons: [...row.buttons, createButtonData()],
            }
          : row
      )
    );
  };

  // 删除按钮
  const deleteButton = (rowId: number, buttonId: string) => {
    setRows(
      rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              buttons: row.buttons.filter((button) => button.id !== buttonId), // 修复：按 `id` 删除按钮
            }
          : row
      )
    );
  };

  // 编辑按钮
  const editButton = (rowId: number, buttonId: string) => {
    const row = rows.find((row) => row.id === rowId);
    if (!row) {
      message.error("未找到对应的行");
      return;
    }
    const button = row.buttons.find((button) => button.id === buttonId);
    if (!button) {
      message.error("未找到对应的按钮");
      return;
    }
    setCurrentEdit({rowId, buttonId});
    setEditVisible(true);
  };

  /**
   * 解析模板。同时确保rows中有id
   * @param output 
   * @returns 
   */
  const analysisButtonContent = (output: string) => {
    try {
      const json = JSON.parse(output);
      if (!json.rows) {
        message.error("模板格式错误");
        return;
      }
      // 设置输出
      setOutput(JSON.stringify(json, null, 2));
      // 格式化数据
      const newRows: DataRow[] = json.rows;
      // 检测是否有id。么有id就添加一个
      let id = 0;
      const rows = newRows.map((row) => {
        if (!row.id) {
          id += 1;
          return {
            ...row,
            id: id,
          };
        }
        // 存在，看看是否小于当前最大值
        if (row.id <= id) {
          id += 1;
          return {
            ...row,
            id: id,
          };
        }
        return row;
      });
      setRows(rows);
    } catch {
      message.error("解析模板失败，请检查格式");
    }
  };

  //  复制模板到剪贴板
  const copyTemplate = () => {
    navigator.clipboard
      .writeText(output)
      .then(() => message.info("模板已复制到剪贴板"));
  };

  // 创建模板
  const generateOutput = useCallback(() => {
    return {
      rows: rows.map((row) => ({
        buttons: row.buttons.map((button) => ({
          id: button.id,
          render_data: button.render_data,
          action: button.action,
        })),
      })),
    };
  }, [rows]);

  // 时时更新输出
  useEffect(() => {
    const template = generateOutput();
    setOutput(JSON.stringify(template, null, 2));
  }, [rows, generateOutput]);

  // 时时存储到本地
  useEffect(() => {
    // 从本地存储中获取数据
    if (!output) {
      const localOutput = localStorage.getItem(QQ_TEMPLATE_KEY);
      if (localOutput) {
        analysisButtonContent(localOutput);
        return;
      }
    }
    // 存在数据。不是init。只要发生变化就存储到本地
    const template = generateOutput();
    localStorage.setItem(QQ_TEMPLATE_KEY, JSON.stringify(template, null, 2));
  }, [output, generateOutput]);

  // 加载模板
  const [visible, setVisible] = useState(false);

  const onFinishLoad = (values: {template: string}) => {
    // 检测是否是json格式的数据
    try {
      const json = JSON.parse(values.template);
      if (Array.isArray(json.rows)) {
        analysisButtonContent(values.template);
        message.success("加载成功");
        setVisible(false);
      } else {
        message.error("模板格式错误");
      }
    } catch {
      message.error("加载失败，请检查格式");
    }
  };

  const onUpload = () => {
    // 选择json文件。
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          if (content) {
            try {
              const json = JSON.parse(content as string);
              setOutput(JSON.stringify(json, null, 2));
            } catch {
              message.error("文件格式错误");
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 编辑按钮
  const [editVisible, setEditVisible] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{
    rowId: number;
    buttonId: string;
  } | null>(null);

  const [from] = useForm();

  useEffect(() => {
    if (editVisible && currentEdit) {
      // 找到数据
      const {rowId, buttonId} = currentEdit;
      const row = rows.find((row) => row.id === rowId);
      if (!row) {
        message.error("未找到对应的行");
        return;
      }
      const button = row.buttons.find((button) => button.id === buttonId);
      if (!button) {
        message.error("未找到对应的按钮");
        return;
      }
      const values: EditFormValues = {
        label: button.render_data.label,
        visited_label: button.render_data.visited_label,
        data: button.action.data,
        type: button.action.type,
        style: button.render_data.style,
        permission: button.action.permission.type,
        click_limit: button.action.click_limit,
        unsupport_tips: button.action.unsupport_tips,
        at_bot_show_channel_list: button.action.at_bot_show_channel_list,
        enter: button.action.enter,
      };
      from.setFieldsValue(values);
    }
  }, [editVisible, currentEdit, rows, from]);

  const onFinishEdit = (values: EditFormValues) => {
    if (!currentEdit) {
      message.error("编辑失败");
      return;
    }
    const {rowId, buttonId} = currentEdit;
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            buttons: row.buttons.map((button) => {
              if (button.id === buttonId) {
                return {
                  ...button,
                  render_data: {
                    ...button.render_data,
                    label: values.label,
                    visited_label: values.visited_label,
                    style: values.style,
                  },
                  action: {
                    ...button.action,
                    data: values.data,
                    type: values.type,
                    permission: {
                      ...button.action.permission,
                      type: values.permission,
                    },
                    click_limit: values.click_limit,
                    unsupport_tips: values.unsupport_tips,
                    at_bot_show_channel_list: values.at_bot_show_channel_list,
                    enter: values.enter,
                  },
                };
              }
              return button;
            }),
          };
        }
        return row;
      })
    );
    setEditVisible(false);
  };

  return (
    <div className="flex-1 flex gap-2 flex-col bg-slate-100 p-4  rounded-lg ">
      <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        QQBot 按钮模板编辑器
      </h2>
      <div className="flex-1 flex flex-col xl:flex-row gap-2">
        <MainWorkspace
          rows={rows}
          onUpLoad={() => setVisible(true)}
          //
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          //
          onAddButton={addButtonToRow}
          onEditButton={editButton}
          onDeleteButton={deleteButton}
        />
        <OutputSection output={output} onCopy={copyTemplate} />
      </div>
      <Modal
        title="加载模板"
        open={visible}
        footer={null}
        onCancel={() => setVisible(false)}
      >
        <LoadForm onFinish={onFinishLoad} onUpload={onUpload} />
      </Modal>
      {
        // 编辑按钮内容
      }
      <Modal
        title="编辑按钮"
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={() => from.submit()}
        okText="保存"
        cancelText="取消"
      >
        <EditForm form={from} onFinish={onFinishEdit} />
      </Modal>
    </div>
  );
};

export default ButtonTemplate;
