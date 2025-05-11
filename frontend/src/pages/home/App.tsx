import {Outlet, useLocation, useNavigate} from "react-router-dom";
import SiderMenu from "./SiderMenu";
import {Breadcrumb} from "antd";

const map = {
  bots: "机器人",
  configs: "配置",
  config: "配置",
  packages: "配置",
  package: "配置",
  create: "创建",
  update: "更新",
  accounts: "账户",
  account: "账户",
  me: "我的",
  login: "登录",
  "button-template": "按钮模板",
  register: "注册",
  settings: "设置",
  "update-password": "修改密码",
  "update-email": "修改邮箱",
};

/**
 *
 * @returns
 */
const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 根据路径动态生成面包屑
  const pathSnippets = location.pathname.split("/").filter((i) => i);

  // 处理路径参数
  const breadcrumbItems = pathSnippets.map((name, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      title: map[name] || name,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(url);
      },
    };
  });

  return <Breadcrumb className=" cursor-pointer" items={breadcrumbItems} />;
};

const Home = () => {
  return (
    <>
      <aside>
        <SiderMenu />
      </aside>
      <div className="w-full flex flex-col">
        <div className="px-4 py-2 bg-slate-200">
          <Breadcrumbs />
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default Home;
