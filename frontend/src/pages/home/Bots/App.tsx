import {Button, Spin, Card, Tag, Popconfirm, message} from "antd";
import {useNavigate} from "react-router-dom";
import {useCommon} from "@/hook/useCommon";
import {useEffect, useState} from "react";
import {
  apiBotList,
  apiBotYarnInstall,
  apiBotInfo,
  apiBotDelete,
  BotInfo,
} from "@/api";
import Pagination from "@/commom/Pagination";
import Headings from "./Headings";
import "./index.scss";

/**
 * @returns
 */
const Home = () => {
  const navigate = useNavigate();
  const goNodejs = () => {
    navigate("/apps/nodejs");
  };
  const [common] = useCommon();

  // 卡片数据

  const [bots, setBots] = useState<BotInfo[]>([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 8,
    total: 0,
  });
  const [curData, setCurData] = useState<BotInfo[]>([]);

  // 依赖加载loading状态
  const [loadingNames, setLoadingNames] = useState<string[]>([]);

  useEffect(() => {
    if (!common.info.start_at) return;
    apiBotList().then((res) => {
      setBots(res);
      setPageInfo((prev) => ({...prev, total: res.length}));
    });
  }, [common.info]);

  // 加载依赖
  const onInstall = (name: string) => {
    if (loadingNames.includes(name)) return;
    setLoadingNames((prev) => [...prev, name]);
    apiBotYarnInstall({name}).then(() => {
      // 轮询依赖安装完成
      const poll = () => {
        apiBotInfo({name}).then((res) => {
          if (!res.node_modules) {
            setTimeout(poll, 1000);
            return;
          }
          setLoadingNames((prev) => prev.filter((item) => item !== name));
          // 刷新数据
          apiBotList().then((res) => {
            setBots(res);
            setPageInfo((prev) => ({...prev, total: res.length}));
          });
        });
      };
      poll();
    });
  };

  useEffect(() => {
    const start = (pageInfo.page - 1) * pageInfo.pageSize;
    const end = pageInfo.page * pageInfo.pageSize;
    setCurData(bots.slice(start, end));
  }, [bots, pageInfo.page, pageInfo.pageSize]);

  // 删除机器人
  const onDelete = (name: string) => {
    apiBotDelete({name}).then(() => {
      message.success("删除成功");
      apiBotList().then((res) => {
        setBots(res);
        setPageInfo((prev) => ({...prev, total: res.length}));
      });
    });
  };
  return (
    <Spin
      spinning={common.loading}
      tip="加载中..."
      className="w-full h-full flex-1 flex"
    >
      {common.loading || common.info.node.installed ? (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-zinc-900 transition-colors">
          <div className="w-full px-8 pt-4 flex-shrink-0">
            <Headings
              onUpdate={() => {
                apiBotList().then((res) => {
                  setBots(res);
                  setPageInfo((prev) => ({...prev, total: res.length}));
                });
              }}
            />
          </div>
          <div className="flex-1 w-full overflow-auto">
            <div className="min-w-full overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8 box-border">
                {curData.length === 0 ? (
                  <div className="text-gray-400 text-lg col-span-full">
                    暂无机器人
                  </div>
                ) : (
                  curData.map((bot) => (
                    <Card
                      key={bot.name}
                      hoverable
                      className="shadow-md border-0 rounded-xl bg-white dark:bg-zinc-800 transition-colors flex flex-col justify-between"
                      onClick={() => navigate(`/bots/${bot.name}`)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {bot.name}
                        </span>
                        <Tag color={bot.status === 1 ? "green" : "red"}>
                          {bot.status === 1 ? "running" : "stop"}
                        </Tag>
                      </div>
                      <div className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                        PID: {bot.pid || "-"}
                      </div>
                      <div className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                        PORT: {bot.port || "-"}
                      </div>
                      <div className="text-gray-400 dark:text-gray-400 text-xs mb-2">
                        创建时间: {bot.create_at}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {!bot.node_modules ? (
                          <Button
                            type="primary"
                            className="flex-1 text-black bg-yellow-500"
                            loading={loadingNames.includes(bot.name)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onInstall(bot.name);
                            }}
                          >
                            加载依赖
                          </Button>
                        ) : null}
                        <Popconfirm
                          title="彻底删除"
                          description="你确定删除这个机器人吗?"
                          onConfirm={(e) => {
                            if (e) e.stopPropagation();
                            onDelete(bot.name);
                          }}
                          onCancel={(e) => e && e.stopPropagation()}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="primary"
                            danger
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
          <div
            className="w-full flex items-center justify-center"
            style={{minHeight: 64}}
          >
            <div className="w-full">
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
          </div>
        </div>
      ) : (
        <section className="flex-1 w-full h-full flex flex-col justify-center items-center bg-slate-100 dark:bg-zinc-900 transition-colors">
          <div className="flex flex-col gap-6 items-center">
            <div className="text-3xl text-gray-900 dark:text-gray-100">
              NodeJS 未安装，无法管理机器人
            </div>
            <Button
              onClick={() => goNodejs()}
              className="bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
            >
              了解如何安装
            </Button>
          </div>
        </section>
      )}
    </Spin>
  );
};

export default Home;
