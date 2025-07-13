import { useEffect, useState } from 'react';
// import { Data, DataPrivate, Message, PrivateMessage, User } from './typing';
import { User} from './typing';
import MessageWondow from './component/MessageWindow';
import { DATA, parseMessage } from './core';
import Textarea from './component/Textarea';
import MessageHeader from './component/MessageHeader';
import { Button } from 'antd';
export default function PrivateApp({
  config,
  status,
  bot,
  user
}: {
  config: {
    host: string;
    port: string;
  };
  status: boolean;
  bot: User;
  user: User;
}) {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<any[]>([]);

  /**
   * 添加消息
   */
  const addMessage = (event: any) => {
    if (event.t == 'send_private_message') {
      const d = event.d;
      setMessage(message => [...message, d]);
    } else if (event.t == 'post_private') {
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
        t: 'get_private',
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

    console.log('msg', msg);

    // 解析msg成结构体。
    const MessageBody = parseMessage({
      Users: [],
      Channels: [],
      input: msg
    });

    console.log('MessageBody', MessageBody);

    const data: any = {
      t: 'send_private_message',
      d: {
        UserId: user.UserId,
        UserName: user.UserName,
        UserAvatar: user.UserAvatar,
        IsBot: false,
        OpenId: user.OpenId,
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
    const data: any = {
      t: 'del_private',
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
      value: string;
      type: string;
    }[]
  >([]);

  const onClick = async () => {
    // 打开指令列表
    if (command.length == 0) {
      // 获取指令列表
      const url = `http://${config.host}:${config.port}/command.json`;
      const urls = `http://${config.host}:${config.port}/command.private.json`;
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
    }
  };

  return (
    <section className="flex-1 flex flex-col  overflow-auto ">
      <MessageHeader
        onClick={onClick}
        value={{
          avatar: bot.UserAvatar,
          decs: bot.UserId,
          name: bot.UserName
        }}
      ></MessageHeader>
      {
        // 消息窗口
      }
      <div className="flex-1 flex overflow-auto">
        {command.length != 0 && (
          <div className="bg-[var(--vscode-panel-background)] flex flex-col gap-2 overflow-auto min-w-14 p-2 shadow-inner">
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
          onInput={val => setValue(val)}
        />
      </div>
      {
        // 输入窗口
      }
      <Textarea
        value={value}
        onContentChange={val => setValue(val)}
        onClickSend={() => sendMessage(value)}
        userList={[]}
      />
    </section>
  );
}
