import {useDispatch} from "react-redux";
import {message} from "antd";
import {useNavigate} from "react-router-dom";
import {apiLogin} from "../../api";
import {setToken} from "../../redux/login";
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
        navigate("/");
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
    <div className="bg-slate-100 flex size-full flex-col justify-center items-center">
      <div className="animate__animated animate__fadeIn flex gap-4 flex-col shadow-md bg-white rounded-md p-4">
        <div className="">
          <h2 className=" text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            登录到您的账户
          </h2>
        </div>
        <div className="p-4">
          <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  用户名
                </label>
              </div>
              <div className="mt-2">
                <input
                  type="username"
                  name="username"
                  autoComplete="current-password"
                  required
                  className="border block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  密码
                </label>
                <div className="text-sm">
                  <span
                    onClick={handleForgetPassword}
                    className="font-semibold cursor-pointer text-indigo-600 hover:text-indigo-500"
                  >
                    忘记密码？
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  className="border block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                登录
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
