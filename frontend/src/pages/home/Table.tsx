import {PropsWithChildren, useEffect, useState} from "react";
import {
  apiBotDelete,
  apiBotInfo,
  apiBotYarnInstall,
  apiBotList,
  apiBotRun,
  apiBotStop,
  BotInfo,
} from "../../api";
import {Button, message, Popconfirm, Spin} from "antd";
import {useNavigate} from "react-router-dom";
import Pagination from "../../commom/Pagination";
import Tags from "../../commom/Tags";
const Table = () => {
  // 表头
  const headings = [
    {id: 2, name: "Name"},
    {id: 3, name: "Status"},
    {id: 1, name: "Pid"},
    {id: 4, name: "Create"},
    {id: 5, name: "Action"},
  ];

  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 数据
  const [data, setData] = useState<BotInfo[]>([]);

  const initData = () => {
    // fetch data
    apiBotList().then(async (res) => {
      const curData = res.map((info) => {
        return {
          name: info.name,
          status: info.status,
          pid: info.pid,
          node_modules: info.node_modules,
          create_at: info.create_at,
        };
      });
      setPageInfo({
        ...pageInfo,
        total: res.length,
      });
      setData(curData);
    });
  };

  const initDataByName = (name: string) => {
    apiBotInfo({name}).then((res) => {
      // 更新数据
      setDateByAPI(res);
    });
  };

  useEffect(() => {
    initData();
  }, []);

  const onRun = (name: string) => {
    console.log(name);
    apiBotRun({
      name,
    }).then((res) => {
      console.log("res", res);
      initDataByName(name);
    });
  };

  const onStop = (name: string) => {
    console.log(name);
    apiBotStop({
      name,
    }).then((res) => {
      console.log("res", res);
      initDataByName(name);
    });
  };

  const [names, setNames] = useState<string[]>([]);

  const setDateByAPI = (item: BotInfo) => {
    const index = data.findIndex((i) => i.name === item.name);
    if (index == -1) {
      setData([...data, item]);
      return;
    }
    data[index] = item;
    setData([...data]);
  };

  // 开始轮训
  const startPolling = (name: string) => {
    setTimeout(() => {
      apiBotInfo({name})
        .then((res) => {
          if (!res.node_modules) {
            // 继续轮训。
            startPolling(name);
            return;
          }
          // 去掉loading
          setNames((prev) => prev.filter((item) => item !== name));
          // 更新数据
          setDateByAPI(res);
        })
        .catch((err) => {
          console.log("err", err);
          message.error("安装失败");
        });
    }, 1000);
  };

  const onInstall = (name: string) => {
    if (names.includes(name)) {
      message.warning("正在安装中，请稍后");
      return;
    }
    setNames((prev) => [...prev, name]);
    // 安装依赖
    apiBotYarnInstall({
      name,
    })
      .then((res) => {
        console.log("res", res);
        startPolling(name);
      })
      .catch((err) => {
        console.log("err", err);
        message.error("安装失败");
      });
  };

  const onDelete = (name: string) => {
    // 删除
    apiBotDelete({
      name,
    })
      .then((res) => {
        console.log("res", res);
        setData((prev) => prev.filter((item) => item.name !== name));
      })
      .catch((err) => {
        console.log("err", err);
        message.error("删除失败");
      });
  };

  const navigate = useNavigate();

  /**
   * @param name
   */
  const onGoPanel = (name: string) => {
    // 前往 机器人面板，带上参数
    navigate(`/panel/${name}`);
  };

  const TD = ({children}: PropsWithChildren) => {
    return <td className="px-6 py-4 whitespace-nowrap min-w-20">{children}</td>;
  };

  return (
    <>
      <div className="flex-1 overflow-auto w-60 md:w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headings.map((item) => (
                <th
                  key={item.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.name}>
                <TD>{item.name}</TD>
                <TD>
                  {item.status ? (
                    <Tags type="green">running</Tags>
                  ) : (
                    <Tags type="yellow">stop</Tags>
                  )}
                </TD>
                <TD>{item.pid}</TD>
                <TD>{item.create_at}</TD>
                <TD>
                  <Spin spinning={names.includes(item.name)} size="small">
                    <div className="flex gap-2 justify-end">
                      {item.node_modules && item.status ? (
                        <Button
                          type="primary"
                          className="bg-red-500 "
                          onClick={() => onStop(item.name)}
                        >
                          停止
                        </Button>
                      ) : null}
                      {item.node_modules && !item.status ? (
                        <Button
                          type="primary"
                          className=""
                          onClick={() => onRun(item.name)}
                        >
                          运行
                        </Button>
                      ) : null}
                      {!item.node_modules ? (
                        <Button
                          type="primary"
                          className="text-black bg-yellow-500"
                          onClick={() => onInstall(item.name)}
                        >
                          加载依赖
                        </Button>
                      ) : null}
                      {item.node_modules ? (
                        <Button
                          type="primary"
                          className=" bg-blue-500"
                          onClick={() => onGoPanel(item.name)}
                        >
                          详细
                        </Button>
                      ) : null}
                      <Button
                        type="primary"
                        className=" bg-blue-500"
                        onClick={() => {
                          navigate(`/panel/${item.name}/xterm-date`);
                        }}
                      >
                        日志
                      </Button>
                      <Popconfirm
                        title="彻底删除"
                        description="你确定删除这个机器人吗?"
                        onConfirm={() => onDelete(item.name)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="primary" className="bg-red-500">
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                  </Spin>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        total={pageInfo.total}
        pageSize={pageInfo.pageSize}
        page={pageInfo.page}
        onPageChange={(page) => {
          console.log("page", page);
        }}
      />
    </>
  );
};

export default Table;
