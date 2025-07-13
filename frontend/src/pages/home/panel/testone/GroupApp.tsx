import { useEffect, useState } from 'react';
// import {
//   Channel,
//   Data,
//   DataPublic,
//   Message,
//   PublicMessage,
//   User
// } from '../typing';
import {
  Channel,
  User
} from './typing';
import MessageWondow from './component/MessageWindow';
import { DATA, initUser, parseMessage } from './core';
import Textarea from './component/Textarea';
import MessageHeader from './component/MessageHeader';
import { Button } from 'antd';

export default function GroupApp({
  config,
  status,
  // channel,
  channels,
  // user,
  users
}: {
  config: {
    host: string;
    port: string;
  };
  status: boolean;
  channels: Channel[];
  users: User[];
}) {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<any[]>([]);
  const [channel, setChannel] = useState<Channel>({
    GuildId: channels[0]?.GuildId ?? '',
    ChannelId: channels[0]?.ChannelId ?? '',
    ChannelName: channels[0]?.ChannelName ?? '',
    ChannelAvatar: channels[0]?.ChannelAvatar ?? ' '
  });
  // const [user, setUser] = useState<User>({
  //   UserId: users[0]?.UserId ?? '',
  //   UserName: users[0]?.UserName ?? '',
  //   UserAvatar: users[0]?.UserAvatar ?? '',
  //   OpenId: users[0]?.OpenId ?? '',
  //   IsBot: users[0]?.IsBot ?? false
  // });
  /**
   * 添加消息
   */
  const addMessage = (event: any) => {
    if (event.t == 'send_message') {
      const d = event.d;
      setMessage(message => [...message, d]);
    } else if (event.t == 'post_channel') {
      const d = event.d;
      setMessage(d.map(item => item.d));
    }
  };

  useEffect(() => {
    // 断开的。
    if (!window.socket) return;
    if (!status) {
      // 清除监听
      window.socket.onmessage = null;
    }
    // 监听消息事件
    window.socket.onmessage = db => {
      const event = DATA.parse(db.data);
      console.log('t', event.t);
      addMessage(event);
    };
    if (message.length !== 0) {
      return;
    }
    // 获取消息
    const createAt = Date.now();
    // 发送消息
    window.socket.send(
      JSON.stringify({
        t: 'get_channel',
        d: {
          createAt
        }
      })
    );
    return () => {
      if (!window.socket) return;
      window.socket.onmessage = null;
    };
  }, [status]);

  /**
   * 发送消息
   * @param msg
   */
  const sendMessage = (msg: string) => {
    if (!status || !window.socket || !msg) return;

    // 解析msg成结构体。
    const MessageBody = parseMessage({
      Users: users,
      Channels: channels,
      input: msg
    });

    console.log('MessageBody', MessageBody);

    const data: any = {
      t: 'send_message',
      d: {
        GuildId: channel.GuildId,
        ChannelId: channel.ChannelId,
        UserId: initUser.UserId,
        UserName: initUser.UserName,
        UserAvatar: initUser.UserAvatar,
        IsBot: false,
        OpenId: initUser.OpenId,
        MessageId: Date.now(),
        createAt: Date.now(),
        MessageBody: MessageBody
      }
    };

    // 添加消息
    addMessage(data);

    // 清空
    setValue('');

    // 发送消息
    window.socket.send(DATA.stringify(data));
  };

  /**
   * 删除消息
   * @param item
   * @returns
   */
  const onClickDel = (item: any) => {
    if (!status) return;
    const data = {
      t: 'del_channel',
      d: {
        createAt: Date.now(),
        MessageId: item.MessageId
      }
    };
    window.socket.send(DATA.stringify(data));
    setMessage(message.filter(i => i.MessageId != item.MessageId));
  };

  const [command, setCommand] = useState<
    {
      name: string;
      type: string;
      value: string;
    }[]
  >([]);

  const onClick = async () => {
    // 打开指令列表
    if (command.length == 0) {
      // 获取指令列表
      const url = `http://${config.host}:${config.port}/command.json`;
      const urls = `http://${config.host}:${config.port}/command.public.json`;
      await fetch(url)
        .then(res => res.json())
        .then((res: any[]) => {
          setCommand(data => [...res, ...data]);
        })
        .catch(err => {
          console.log(err);
        });
      await fetch(urls)
        .then(res => res.json())
        .then((res: any[]) => {
          setCommand(data => [...res, ...data]);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      setCommand([]);
    }
  };

  return (
    <section className="flex-1 flex flex-col  overflow-auto ">
      <MessageHeader
        onClick={onClick}
        value={{
          avatar: channel.ChannelAvatar,
          decs: channel.GuildId,
          name: channel.ChannelName
        }}
      >
        <div className="px-4  flex flex-row items-center  ">
          <select
            onChange={e => {
              const index = e.target.selectedIndex;
              setChannel(channels[index]);
            }}
            className="px-2 py-1 rounded-md bg-[var(--vscode-input-background)] hover:bg-[var(--vscode-activityBar-background)] text-[var(--vscode-input-foreground)]"
          >
            {channels.map((item, index) => {
              return (
                <option key={index} value={item.ChannelId}>
                  {item.ChannelId}
                </option>
              );
            })}
          </select>
        </div>
      </MessageHeader>
      {
        // 消息窗口
      }
      <div className="flex-1 flex overflow-auto">
        {command.length != 0 && (
          <div className="bg-[var(--vscode-panel-background)] flex flex-col gap-2 overflow-auto min-w-14 p-1 m-1 shadow-inner">
            {command.map((item, index) => {
              return (
                <Button
                  key={index}
                  onClick={() => {
                    sendMessage(item.value);
                  }}
                >
                  {item?.name ?? item.value}
                </Button>
              );
            })}
          </div>
        )}
        <MessageWondow
          message={message}
          onClickDel={onClickDel}
          onSend={sendMessage}
          onInput={val => {
            console.log('val', val);
            setValue(val);
          }}
        />
      </div>
      {
        // 输入窗口
      }
      <Textarea
        value={value}
        onContentChange={val => setValue(val)}
        onClickSend={() => sendMessage(value)}
        userList={[
          {
            UserId: 'everyone',
            UserName: '全体成员',
            UserAvatar: '',
            OpenId: 'everyone',
            IsBot: false
          },
          ...users
        ]}
      />
    </section>
  );
}
