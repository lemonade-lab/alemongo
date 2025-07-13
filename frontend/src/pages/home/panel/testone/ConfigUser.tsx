import { useState } from 'react';
import { User } from './typing';
import { Button } from 'antd';
import { Input } from 'antd';
import { Switch } from 'antd';
/**
 * @returns
 */
export default function ConfigUser({
  onSubmit,
  users,
  onDelete
}: {
  onSubmit: (user: User, per_user: User) => void;
  users: User[];
  onDelete: (user: User) => void;
}) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState<User>({
    UserId: '',
    UserName: '',
    UserAvatar: '',
    OpenId: '',
    IsBot: false
  });
  const onOpen = (user: User) => {
    setFormData(user);
    setShow(true);
  };
  return (
    <section className="flex-1 flex flex-col overflow-auto scrollbar">
      <section className="h-full w-full flex-1 flex flex-col gap-2 py-2 select-none">
        {/* 用户列表 */}
        <div className="py-2 px-2">
          <div className="flex flex-col gap-2 border-[var(--vscode-sidebar-border)]">
            <div className="flex justify-between items-center">
              <div className="font-semibold">用户列表</div>
              <Button
                onClick={() => {
                  setFormData({
                    UserId: '',
                    UserName: '',
                    UserAvatar: '',
                    OpenId: '',
                    IsBot: false
                  });
                  setShow(true);
                }}
              >
                新增
              </Button>
            </div>
            {users.map((item, index) => (
              <div
                key={index}
                className="flex flex-row justify-between border-y border-[var(--vscode-sidebar-border)] bg-[var(--vscode-editor-background)]"
              >
                <div className="flex flex-row gap-3 px-2 py-1 cursor-pointer">
                  <div className="flex items-center">
                    {item.UserAvatar && item.UserAvatar != '' && (
                      <img
                        className="size-10 rounded-full"
                        src={item.UserAvatar}
                        alt="Avatar"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold ">{item.UserName}</div>
                    <div className="text-sm text-[var(--vscode-textPreformat-background)]">
                      {item.UserId}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <Button onClick={() => onOpen(item)}>编辑</Button>
                  {users.length !== 0 && (
                    <Button onClick={() => onDelete(item)}>删除</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {show && (
          <form
            onSubmit={async event => {
              // 阻止表单默认提交行为
              event.preventDefault();
              try {
                const UserId = event.currentTarget.UserId.value;
                const UserName = event.currentTarget.UserName.value;
                const UserAvatar = event.currentTarget.UserAvatar.value;
                const OpenId = event.currentTarget.OpenId.value;
                const IsBot = event.currentTarget.IsBot.checked;
                const data = {
                  UserId,
                  UserName,
                  UserAvatar,
                  OpenId,
                  IsBot
                };
                await onSubmit(data, formData);
                setShow(false);
              } catch (e) {
                console.error(e);
              }
            }}
            className="flex flex-col gap-2 py-2  px-2 border-[var(--vscode-sidebar-border)]"
          >
            <div className="font-semibold">用户配置</div>
            <Input
              type="text"
              id="UserId"
              name="UserId"
              defaultValue={formData.UserId}
              placeholder="用户编号"
            />
            <Input
              type="text"
              id="UserName"
              name="UserName"
              defaultValue={formData.UserName}
              placeholder="用户昵称"
            />
            <Input
              type="text"
              id="UserAvatar"
              name="UserAvatar"
              defaultValue={formData.UserAvatar}
              placeholder="用户头像"
            />
            <Input
              type="text"
              id="OpenId"
              name="OpenId"
              defaultValue={formData.OpenId}
              placeholder="用户开放ID"
            />
            <div className="flex flex-row gap-2 items-center">
              <div>是否为机器人</div>
              <Switch
                // name="IsBot"
                value={formData.IsBot}
                defaultChecked={formData.IsBot}
              ></Switch>
            </div>
            <div className="flex justify-end gap-4">
              <Button onClick={() => setShow(false)}>关闭</Button>
              <Button htmlType="submit">保存</Button>
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
