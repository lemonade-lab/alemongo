import {useEffect, useState} from "react";
import {
  apiBotDelete,
  apiBotInfo,
  apiBotYarnInstall,
  apiBotList,
  BotInfo,
} from "../../api";
import {Button, message, Popconfirm, Spin, Table, TableProps, Tag} from "antd";
import {useNavigate} from "react-router-dom";
import Pagination from "../../commom/Pagination";
const BotTable = () => {
  // 数据
  const [data, setData] = useState<BotInfo[]>([]);
  const [curData, setCurData] = useState<BotInfo[]>([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 8,
    total: 0,
  });
  useEffect(() => {
    const start = (pageInfo.page - 1) * pageInfo.pageSize;
    const end = pageInfo.page * pageInfo.pageSize;
    setCurData(data.slice(start, end));
  }, [data, pageInfo.page, pageInfo.pageSize]);

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

  useEffect(() => {
    initData();
  }, []);

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

  const columns: TableProps<BotInfo>["columns"] = [
    {
      title: "昵称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status) => (status == 1 ? <Tag>running</Tag> : <Tag>stop</Tag>),
    },
    {
      title: "PID",
      dataIndex: "pid",
      key: "pid",
    },
    {
      title: "创建时间",
      dataIndex: "create_at",
      key: "create_at",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Spin spinning={names.includes(record.name)} size="small">
          <div className="flex gap-2 justify-end">
            {!record.node_modules ? (
              <Button
                type="primary"
                className="text-black bg-yellow-500"
                onClick={() => onInstall(record.name)}
              >
                加载依赖
              </Button>
            ) : null}
            {record.node_modules ? (
              <Button
                type="primary"
                className=" bg-blue-500"
                onClick={() => onGoPanel(record.name)}
              >
                详细
              </Button>
            ) : null}
            <Button
              type="primary"
              className=" bg-blue-500"
              onClick={() => {
                navigate(`/panel/${record.name}/xterm-date`);
              }}
            >
              日志
            </Button>
            <Popconfirm
              title="彻底删除"
              description="你确定删除这个机器人吗?"
              onConfirm={() => onDelete(record.name)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="primary" className="bg-red-500">
                删除
              </Button>
            </Popconfirm>
          </div>
        </Spin>
      ),
    },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 border">
        <Table
          className="overflow-auto w-screen h-[calc(100vh-20rem)] xl:size-full"
          pagination={false}
          rowKey={(item) => item.name}
          columns={columns}
          dataSource={curData}
        />
      </div>
      <Pagination
        total={pageInfo.total}
        pageSize={pageInfo.pageSize}
        page={pageInfo.page}
        onPageChange={(page) => {
          setPageInfo({
            ...pageInfo,
            page,
          });
        }}
      />
    </div>
  );
};

export default BotTable;
