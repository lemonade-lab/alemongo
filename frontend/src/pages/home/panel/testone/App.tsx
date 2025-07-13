import {useEffect, useRef, useState} from "react";
import SettingApp from "./Setting";
import {initBot, initChannel, initConfig, initUser} from "./core";
import GroupApp from "./GroupApp";
import PrivateApp from "./PrivateApp";
import ConfigUser from "./ConfigUser";
import ConfigChannel from "./ConfigChannel";
import {Channel, User} from "./typing";
import {isArray} from "lodash-es";

export default function App() {
  const [status, setStatus] = useState<boolean>(false);
  const [tag, setTag] = useState<
    "group" | "private" | "setting" | "config.user" | "config.guild"
  >("group");

  const [config, setConfig] = useState({
    host: initConfig.host,
    port: initConfig.port,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  // 保存定时任务。确保只有一个定时任务
  const timeRef = useRef<any>(null);
  const configRef = useRef<any>(null);
  const countRef = useRef<number>(0);

  useEffect(() => {
    configRef.current = config;
    countRef.current = 0;
  }, [config]);

  useEffect(() => {
    if (!window.vscode) return;

    const action: {
      [key: string]: (payload: any) => void;
    } = {
      "alemonjs.openSetting": () => {
        setTag("setting");
      },
      "alemonjs.openConfigUser": () => {
        setTag("config.user");
      },
      "alemonjs.openConfigGuild": () => {
        setTag("config.guild");
      },
      "alemonjs.openGroup": () => {
        setTag("group");
      },
      "alemonjs.openPrivate": () => {
        setTag("private");
      },
    };

    // 等待信息
    const handleResponse = (event: {
      data: {
        type: string;
        payload: any;
      };
    }) => {
      const message = event.data;
      console.log("message", message);
      if (action[message.type]) {
        action[message.type](message.payload);
      } else if (message.type === "fs.readFile") {
        const code = message.payload.code;
        // gui/config.json
        if (code === 1000) {
          const data = message.payload.data;
          if (data) {
            setConfig({
              host: data?.host ?? initConfig.host,
              port: data?.port ?? initConfig.port,
            });
          }
        } else if (code === 1010) {
          const data = message.payload.data;
          if (data && isArray(data)) {
            setUsers(data);
          }
        } else if (code === 1020) {
          const data = message.payload.data;
          if (data && isArray(data)) {
            setChannels(data);
          }
        }
      }
    };


    setTimeout(() => {
      connect && connect();
    }, 300);

    window.addEventListener("message", handleResponse);
    return () => {
      window.removeEventListener("message", handleResponse);
    };
  }, []);

  const connect = () => {
    try {
      // 清除定时任务
      if (timeRef.current) clearTimeout(timeRef.current);
      // 如果已经连接，直接返回
      if (window.socket && window.socket.readyState === 1) return;
      // 创建socket
      const socket = new WebSocket(
        `ws://${configRef.current.host}:${configRef.current.port}`
      );
      // 监听连接打开事件
      socket.onopen = () => {
        console.log("连接已建立");
        setStatus(true);
        countRef.current = 0;
      };
      // 监听连接关闭事件
      socket.onclose = () => {
        setStatus(false);
        console.log("连接已关闭");
        // 连接关闭的时候，1.7s后重连
        let time = 1700;
        if (countRef.current > 5) {
          time = 2700;
        } else if (countRef.current > 10) {
          time = 3700;
        } else if (countRef.current > 15) {
          time = 4700;
        } else if (countRef.current > 20) {
          time = 5700;
        }
        timeRef.current = setTimeout(() => {
          connect && connect();
          countRef.current = countRef.current + 1;
        }, time);
      };
      window.socket = socket;
    } catch (e) {
      setStatus(false);
      // 连接错误的时候，3.7s后重连
      let time = 3700;
      if (countRef.current > 15) {
        time = 4700;
      } else if (countRef.current > 20) {
        time = 5700;
      }
      timeRef.current = setTimeout(() => {
        connect && connect();
        countRef.current = countRef.current + 1;
      }, time);
    }
  };

  /**
   * @param event
   */
  const onSubmitUsers = (user: User, preUser: User) => {
    let values = null;
    // 没有找到
    if (!users.find((item) => item.UserId == preUser.UserId)) {
      // 新增
      values = [...users, user];
    } else {
      values = users.map((item) => {
        if (item.UserId === preUser.UserId) {
          return user;
        }
        return item;
      });
    }
    setUsers(values);
   
  };

  /**
   *
   * @param user
   */
  const onDeleteUser = (user: User) => {
    const values = users.filter((item) => item.UserId !== user.UserId);
    setUsers(values);
   
  };

  /**
   *
   * @param event
   */
  const onSubmitChannel = (channel: Channel, preChannel: Channel) => {
    let values = null;
    // 没有找到
    if (!channels.find((item) => item.ChannelId == preChannel.ChannelId)) {
      // 新增
      values = [...channels, channel];
    } else {
      values = channels.map((item) => {
        if (item.ChannelId === preChannel.ChannelId) {
          return channel;
        }
        return item;
      });
    }
    console.log("values", values);
    setChannels(values);
  };

  const onDeleteChannel = (channel: Channel) => {
    const values = channels.filter(
      (item) => item.ChannelId !== channel.ChannelId
    );
    setChannels(values);
  
  };

  /**
   *
   * @param event
   */
  const onSubmitConfig = (event: React.FormEvent<HTMLFormElement>) => {
    const host = event.currentTarget.host.value;
    const port = event.currentTarget.port.value;
    const data = {
      host,
      port,
    };
    setConfig(data);

    console.log("data", data);
  };

  return (
    <section className="overflow-hidden flex flex-1 flex-col bg-[var(--vscode-sideBar-background)] ">
      {tag === "config.user" && (
        <ConfigUser
          users={users.length == 0 ? [initUser] : users}
          onSubmit={onSubmitUsers}
          onDelete={onDeleteUser}
        />
      )}
      {tag === "config.guild" && (
        <ConfigChannel
          channels={channels.length == 0 ? [initChannel] : channels}
          onSubmit={onSubmitChannel}
          onDelete={onDeleteChannel}
        />
      )}
      {tag === "private" && (
        <PrivateApp
          config={config}
          status={status}
          bot={initBot}
          user={users.length == 0 ? initUser : users[0]}
        />
      )}
      {tag === "group" && (
        <GroupApp
          config={config}
          status={status}
          // channel={{}}
          channels={channels.length == 0 ? [initChannel] : channels}
          // user={{}}
          users={users.length == 0 ? [initBot] : [initBot, ...users]}
        />
      )}
      {tag === "setting" && (
        <SettingApp value={config} onSubmit={onSubmitConfig} />
      )}
      <header className="flex flex-row justify-between items-center px-4 select-none ">
        ws://{config.host}:{config.port} {status ? "connet" : "close"}
      </header>
    </section>
  );
}
