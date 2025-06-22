import {useNavigate} from "react-router-dom";

const NotRoute = () => {
  const navigate = useNavigate();
  return (
    <main className="flex-1 grid place-items-center bbg-slate-100 dark:bg-zinc-900  px-6 py-24 sm:py-32 lg:px-8 transition-colors">
      <div className="max-w-lg w-full text-center">
        <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-3xl">
          404
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
          该页面不存在
        </h1>
        <p className="mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400">
          抱歉，我们无法找到您要查找的页面。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-md bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition"
          >
            回到首页
          </button>
          <button
            onClick={() => window.open("https://alemonjs.com", "_blank")}
            className="text-sm font-semibold text-gray-900 dark:text-gray-200 hover:underline flex items-center gap-1"
          >
            联系我们
            <span aria-hidden="true" className="text-lg">
              &rarr;
            </span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotRoute;
