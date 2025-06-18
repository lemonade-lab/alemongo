import {Form, Input, message} from "antd";
import {useNavigate} from "react-router-dom";
import {apiPassword} from "../../../api";
import Box from "@/commom/Box";

const UpdatePassWord = () => {
  const navigate = useNavigate();
  const handleSubmit = (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("两次密码不一致");
      return;
    }
    apiPassword({
      old_assword: values.oldPassword,
      password: values.newPassword,
    }).then(() => {
      navigate("/bots");
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
            修改密码
          </div>
          <Form
            onFinish={handleSubmit}
            className="w-full"
            labelCol={{span: 6}}
            wrapperCol={{span: 18}}
            layout="horizontal"
            size="large"
          >
            <Form.Item
              label={
                <span className="text-gray-800 dark:text-gray-100">旧密码</span>
              }
              name="oldPassword"
              rules={[{required: true, message: "请输入旧密码"}]}
            >
              <Input.Password
                name="oldPassword"
                className="block w-full border rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm transition"
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-gray-800 dark:text-gray-100">新密码</span>
              }
              name="newPassword"
              rules={[{required: true, message: "请输入新密码"}]}
            >
              <Input.Password
                name="newPassword"
                className="block w-full border rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm transition"
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-gray-800 dark:text-gray-100">
                  确认密码
                </span>
              }
              name="confirmPassword"
              rules={[{required: true, message: "请再次输入新密码"}]}
            >
              <Input.Password
                name="confirmPassword"
                className="block w-full border rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm transition"
              />
            </Form.Item>
            <Form.Item wrapperCol={{span: 24}}>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
              >
                确认修改
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Box>
  );
};

export default UpdatePassWord;
