import {Button, Input, message} from "antd";
import Box from "@/commom/Box";
import {apiBindEmail, apiVerifyEmail} from "@/api";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux";

const UpdateEmail = () => {
  const storeMe = useSelector((state: RootState) => state.me);
  const [values, setValues] = useState({email: "", code: ""});

  // 验证码 30s禁止点击
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount((prevCount) => {
          if (prevCount <= 1) {
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  const handleSubmit = (values: {email: string; code: string}) => {
    if (!values.email) {
      message.error("请输入邮箱地址");
      return;
    }
    if (!values.code) {
      message.error("请输入验证码");
      return;
    }
    apiVerifyEmail(values);
  };
  const onSendCode = () => {
    if (!values.email) {
      message.error("请输入邮箱地址");
      return;
    }
    if (count > 0) {
      message.error(`请等待 ${count} 秒后再发送`);
      return;
    }
    // 开始倒计时
    setCount(30);
    apiBindEmail({
      email: values.email,
    }).then(() => {
      message.success("验证码已发送，请注意查收");
    });
  };
  return (
    <Box>
      <div className="p-2 flex gap-4 flex-col bg-slate-100 dark:bg-zinc-900 transition-colors flex-1 min-h-screen">
        <div className="flex flex-col items-center gap-2 md:gap-4 xl:gap-6 bg-white dark:bg-zinc-800 p-4 md:p-6  xl:p-8 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-lg transition-colors max-w-md mx-auto w-full">
          <div className="flex items-center justify-center">
            <img
              className="size-16 md:size-20 lg:size-24 xl:size-28 rounded-full shadow"
              src="https://q1.qlogo.cn/g?b=qq&s=0&nk=1715713638"
              alt=""
            />
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            绑定邮箱
          </div>
          {storeMe.info.email && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {`邮箱：${storeMe.info.email}`}
              {storeMe.info.is_email_verified ? "（已验证）" : "（未验证）"}
            </span>
          )}
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit({
                email: (e.target as HTMLFormElement).email.value,
                code: (e.target as HTMLFormElement).newPassword.value,
              });
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-gray-800 dark:text-gray-100">
                  邮箱地址
                </label>
                <Input
                  name="email"
                  value={values.email}
                  onChange={(e) =>
                    setValues({...values, email: e.target.value})
                  }
                  className="flex w-full border rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm transition"
                  placeholder="请输入邮箱地址"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-800 dark:text-gray-100">
                  验证码
                </label>
                <div className="flex flex-row gap-2 items-center">
                  <Input.Password
                    name="newPassword"
                    value={values.code}
                    onChange={(e) =>
                      setValues({...values, code: e.target.value})
                    }
                    className="flex border rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm transition"
                  />
                  <Button onClick={onSendCode}>
                    {count > 0 ? `重新发送(${count})` : "发送验证码"}
                  </Button>
                </div>
              </div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
              >
                确定
              </button>
            </div>
          </form>
        </div>
      </div>
    </Box>
  );
};

export default UpdateEmail;
