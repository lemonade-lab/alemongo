import { useState } from 'react';
import { Channel } from './typing';
import { Button } from 'antd';
import { Input } from 'antd';
/**
 * @returns
 */
export default function ConfigChannel({
  onSubmit,
  channels,
  onDelete
}: {
  onSubmit: (channel: Channel, pre_channel: Channel) => void;
  onDelete: (channel: Channel) => void;
  channels: Channel[];
}) {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState<Channel>({
    GuildId: '',
    ChannelId: '',
    ChannelName: '',
    ChannelAvatar: ''
  });
  const onOpen = (channel: Channel) => {
    setFormData(channel);
    setShow(true);
  };
  return (
    <section className="flex-1 flex flex-col overflow-auto scrollbar">
      <section className="h-full w-full flex-1 flex flex-col gap-2 py-2 select-none">
        {/* 用户列表 */}
        <div className="py-2 px-2">
          <div className="flex flex-col gap-2 border-[var(--vscode-sidebar-border)]">
            <div className="flex justify-between items-center">
              <div className="font-semibold">频道列表</div>
              <Button
                onClick={() => {
                  setFormData({
                    GuildId: '',
                    ChannelId: '',
                    ChannelName: '',
                    ChannelAvatar: ''
                  });
                  setShow(true);
                }}
              >
                新增
              </Button>
            </div>
            {channels.map((item, index) => (
              <div
                key={index}
                className="flex flex-row justify-between border-y border-[var(--vscode-sidebar-border)] bg-[var(--vscode-editor-background)]"
              >
                <div className="flex flex-row gap-3 px-2 py-1 cursor-pointer">
                  <div className="flex items-center">
                    {item.ChannelAvatar && item.ChannelAvatar != '' && (
                      <img
                        className="size-10 rounded-full"
                        src={item.ChannelAvatar}
                        alt="Avatar"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold ">{item.ChannelName}</div>
                    <div className="text-sm text-[var(--vscode-textPreformat-background)]">
                      {item.ChannelName}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <Button onClick={() => onOpen(item)}>编辑</Button>
                  {channels.length !== 0 && (
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
                const GuildId = event.currentTarget.GuildId.value;
                const ChannelId = event.currentTarget.ChannelId.value;
                const ChannelName = event.currentTarget.ChannelName.value;
                const ChannelAvatar = event.currentTarget.ChannelAvatar.value;
                const data = {
                  GuildId,
                  ChannelId,
                  ChannelName,
                  ChannelAvatar
                };
                await onSubmit(data, formData);
                setShow(false);
              } catch (e) {
                console.error(e);
              }
            }}
            className="flex flex-col gap-2 py-2  px-2 border-[var(--vscode-sidebar-border)]"
          >
            <div className="font-semibold">频道配置</div>
            <Input
              type="text"
              id="GuildId"
              name="GuildId"
              defaultValue={formData.GuildId}
              placeholder="公会编号"
            />
            <Input
              type="text"
              id="ChannelId"
              name="ChannelId"
              defaultValue={formData.ChannelId}
              placeholder="频道编号"
            />
            <Input
              type="text"
              id="ChannelName"
              name="ChannelName"
              defaultValue={formData.ChannelName}
              placeholder="频道昵称"
            />
            <Input
              type="text"
              id="ChannelAvatar"
              name="ChannelAvatar"
              defaultValue={formData.ChannelAvatar}
              placeholder="频道头像"
            />
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
