import {useEffect, useRef, useState} from "react";
import {User} from "../typing";
import {SendOutlined} from "@ant-design/icons";

interface TextareaProps extends React.HTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onContentChange?: (content: string) => void;
  onClickSend: () => void;
  userList?: User[];
}

export default function Textarea({
  value,
  onContentChange,
  onClickSend,
  userList,
  ...props
}: TextareaProps) {
  // 是否显示用户列表
  const [showUserList, setShowUserList] = useState<boolean>(false);

  // 输入框内容
  const [textareaValue, setTextareaValue] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 监听输入到每一个字符。当输入到@的时候，显示用户列表，并聚焦到第一个用户。
  useEffect(() => {
    // 如果输入的内容以@结尾
    if (textareaValue.endsWith("@")) {
      // 显示用户列表
      setShowUserList(true);
    } else {
      // 隐藏用户列表
      setShowUserList(false);
    }
    // 当输入框内容改变时，触发回调函数
    onContentChange?.(textareaValue);
  }, [textareaValue]);

  useEffect(() => {
    // 如果value有值，且textareaValue不等于value，则更新textareaValue
    if (value && textareaValue !== value) {
      setTextareaValue(value);
      // 确保输入框聚焦
      textareaRef.current?.focus();
    }
  }, [value]);

  // useEffect(() => {
  //   textareaValue !== value && setTextareaValue(value);
  // }, [value]);

  const onSend = async () => {
    try {
      await onClickSend();
      // 清空输入框
      setTextareaValue("");
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * 选择用户
   * @param userName
   */
  const handleUserSelection = (userName: string) => {
    // 选择用户后，将用户名插入到光标处。
    const value = textareaValue.replace(/@$/, `<@${userName}> `);
    setTextareaValue(value);
    showUserList && setShowUserList(false);
  };

  const selectRef = useRef<HTMLDivElement | null>(null);

  // useEffect(() => {
  //   // 聚焦第一个子元素
  //   if (showUserList && userList && userList.length > 1) {
  //     const firstChild = selectRef.current?.firstElementChild as HTMLElement;
  //     firstChild?.focus();
  //   } else {
  //     // 确保重新聚焦到输入框
  //     // 先判断是否聚焦
  //     if (document.activeElement !== textareaRef.current) {
  //       textareaRef.current?.focus();
  //     }
  //   }
  // }, [showUserList]);

  // 输入框内容改变
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value);
    setTextareaValue(e.target.value);
  };

  /**
   * 回车
   * @param e
   */
  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      setTextareaValue(textareaValue + "\n");
    } else if (e.key === "Enter") {
      e.preventDefault();
      console.log("Enter");
      await onSend();
    }
  };

  /**
   * 点击发送按钮
   * @param e
   */
  const onClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    await onSend();
  };

  return (
    <section className="select-none w-full flex flex-row justify-center px-4 py-1">
      <div className="flex gap-2 flex-col border border-[var(--vscode-sidebar-border)] focus-within:border-[var(--vscode-button-background)] bg-[var(--vscode-editor-background)] border-opacity-70 shadow-inner rounded-md w-full p-2">
        {showUserList && userList && userList.length > 1 && (
          <div className="absolute rounded-md w-full max-w-36 max-h-32 overflow-y-auto  shadow-md border border-[var(--vscode-sidebar-border)] bg-[var(--vscode-editor-background)]">
            <div ref={selectRef} className="flex flex-col px-2 py-1">
              {userList.map((user) => (
                <div
                  key={user.UserId}
                  onClick={() => handleUserSelection(user.UserName)}
                  className="rounded-md cursor-pointer p-1 hover:bg-[var(--vscode-activityBar-background)]"
                >
                  {user.UserName}
                </div>
              ))}
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="min-h-20 resize-none max-h-64 border-0 focus:border-0 bg-opacity-0 bg-[var(--vscode-editor-background)] rounded-md "
          placeholder="输入内容..."
          value={textareaValue}
          onChange={onChange}
          onKeyDown={onKeyDown}
          {...props}
        />

        <div className="flex flex-row justify-between ">
          <div className="text-[var(--vscode-textPreformat-background)]">
            Control+Enter 换行
          </div>
          <div
            className="border border-[var(--vscode-sidebar-border)] border-opacity-70  px-3 cursor-pointer rounded-md flex items-center justify-center hover:bg-[var(--vscode-button-background)]"
            onClick={onClick}
          >
            <SendOutlined />
          </div>
        </div>
      </div>
    </section>
  );
}
