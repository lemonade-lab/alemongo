import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Table from "./Table";
import {Button} from "antd";
import {useNavigate} from "react-router-dom";

/**
 * @returns
 */
const Home = () => {
  const installed = useSelector(
    (state: RootState) => state.info.node.installed
  );
  const navigate = useNavigate();
  const goNodejs = () => {
    navigate("/apps/nodejs");
  };
  return (
    <>
      {installed ? (
        <Table
          onClick={(key) => {
            if (key === "node") {
              goNodejs();
            }
          }}
        />
      ) : (
        <section className="flex-1 flex flex-col justify-center items-center bg-slate-100 dark:bg-zinc-900 transition-colors">
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
    </>
  );
};

export default Home;
