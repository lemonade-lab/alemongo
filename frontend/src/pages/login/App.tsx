import {useDispatch} from "react-redux";
import {message} from "antd";
import {useNavigate} from "react-router-dom";
import {apiLogin} from "@/api";
import {setToken} from "@/redux/login";
import "./index.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> & {
      target: HTMLFormElement;
    }
  ) => {
    e.preventDefault();
    if (!e.target) {
      message.error("请填写密码");
      return;
    }
    const password = e.target.password.value;
    const username = e.target.username.value;
    apiLogin({
      password,
      username,
    })
      .then((res) => {
        dispatch(setToken(res.data));
        navigate("/bots");
      })
      .catch((err) => {
        if (err?.response?.data?.msg) {
          message.error(err.response.data.msg);
        } else {
          message.error("登录失败");
        }
      });
  };
  // 忘记密码
  const handleForgetPassword = () => {
    message.warning("请联系超级管理员或编辑服务配置文件");
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg, #667eea 0%, #764ba2 100%)",
        animation: "bgMove 10s ease-in-out infinite alternate",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0, transparent 70%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10) 0, transparent 80%)",
        }}
      />
      <div
        className="animate__animated animate__fadeIn flex gap-4 flex-col shadow-2xl bg-white/90 rounded-2xl p-8 login-glow relative z-10"
        style={{
          animation: "floatCard 3s ease-in-out infinite",
        }}
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-indigo-700 drop-shadow">
            欢迎登录
          </h2>
          <p className="text-center text-gray-500 mt-2">智能机器人管理平台</p>
        </div>
        <div className="p-2">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-base font-medium text-gray-900"
              >
                用户名
              </label>
              <input
                type="username"
                name="username"
                autoComplete="username"
                required
                className="login-input mt-2 border w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 transition"
                placeholder="请输入用户名"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-base font-medium text-gray-900"
                >
                  密码
                </label>
                <span
                  onClick={handleForgetPassword}
                  className="text-sm font-semibold cursor-pointer text-indigo-600 hover:text-indigo-500 transition"
                >
                  忘记密码？
                </span>
              </div>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="login-input mt-2 border w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 transition"
                placeholder="请输入密码"
              />
            </div>
            <button
              type="submit"
              className="login-btn-glow w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-lg font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
            >
              登录
            </button>
          </form>
        </div>
        <div className="text-xs text-center text-gray-400 mt-2 select-none">
          &copy; {new Date().getFullYear()} Lemonade Robot Platform
        </div>
      </div>
    </div>
  );
};

export default Login;
