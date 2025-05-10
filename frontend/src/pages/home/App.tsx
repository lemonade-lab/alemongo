import {Outlet, useLocation, useParams, useNavigate} from "react-router-dom";
import SiderMenu from "./SiderMenu";
import {Breadcrumb} from "antd";

const Breadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // 根据路径动态生成面包屑
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      title: params[pathSnippets[index]] || pathSnippets[index],
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
    <main className="flex flex-1">
      <aside className="flex">
        <SiderMenu />
      </aside>
      <article className="flex-1 flex flex-col">
        <div className="px-4 py-2 bg-slate-200 flex justify-start">
          <Breadcrumbs />
        </div>
        <Outlet />
      </article>
    </main>
  );
};

export default Home;
