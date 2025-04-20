import {useNavigate} from "react-router-dom";

const NotRoute = () => {
  const navigate = useNavigate();
  return (
    <main className="grid place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-indigo-600 text-2xl">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          该页面不存在
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          抱歉，我们无法找到您要查找的页面。
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <div
            onClick={() => navigate("/")}
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            回到首页
          </div>
          <div
            onClick={() => navigate("/contact")}
            className="text-sm font-semibold text-gray-900"
          >
            联系我们
            <span aria-hidden="true">&rarr;</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotRoute;
