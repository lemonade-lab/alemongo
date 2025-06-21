import Table from "./Table";
import {Button, Spin} from "antd";
import {useNavigate} from "react-router-dom";
import "./index.scss";
import {useCommon} from "@/hook/useCommon";

/**
 * @returns
 */
const Home = () => {
  const navigate = useNavigate();
  const goNodejs = () => {
    navigate("/apps/nodejs");
  };
  const [common] = useCommon();
  return (
    <Spin
      spinning={common.loading}
      tip="加载中..."
      className="w-full h-full flex-1 flex"
    >
      {common.loading || common.info.node.installed ? (
        <Table
          onClick={(key) => {
            if (key === "node") {
              goNodejs();
            }
          }}
        />
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
