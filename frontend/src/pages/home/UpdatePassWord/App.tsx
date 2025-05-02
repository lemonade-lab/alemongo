import {Form, Input, message} from "antd";
import {useNavigate} from "react-router-dom";
import {apiPassword} from "../../../api";
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
    })
      .then(() => {
        navigate("/bots");
      })
      .catch((err) => {
        if (err?.response?.data?.msg) {
          message.error(err.response.data.msg);
        } else {
          message.error("修改密码失败");
        }
      });
  };
  return (
    <div className="flex bg-slate-100 justify-center items-center flex-1 p-4">
      <Form
        onFinish={handleSubmit}
        className=" bg-white shadow-m rounded-md p-4"
        labelCol={{span: 8}}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">修改密码</h2>
        <Form.Item label="旧密码" name="oldPassword">
          <Input
            type="password"
            name="oldPassword"
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
          />
        </Form.Item>
        <Form.Item label="新密码" name="newPassword">
          <Input
            type="password"
            name="newPassword"
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
          />
        </Form.Item>
        <Form.Item label="确认密码" name="confirmPassword">
          <Input
            type="password"
            name="confirmPassword"
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
          />
        </Form.Item>
        <div className="flex items-center justify-end">
          <Form.Item>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              确认修改
            </button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default UpdatePassWord;
