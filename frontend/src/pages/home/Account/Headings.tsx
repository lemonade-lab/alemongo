import {useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Modal from "../../../commom/Modal";
import {apiUserCreate} from "@/api/users/admin";
import {message} from "antd";

/**
 *
 * @param param0
 * @returns
 */
const Headings = ({onUpdate}: {onUpdate: () => void}) => {
  const [visible, setVisible] = useState(false);
  const installed = useSelector(
    (state: RootState) => state.info.node.installed
  );
  const onCreateBot = () => {
    setVisible(true);
  };
  /**
   *
   * @param e
   * @returns
   */
  const onSubmit = (values: HTMLFormElement) => {
    // 检查密码是否一致
    if (values.password.value !== values.confirm_password.value) {
      message.error("密码不一致");
      return;
    }
    apiUserCreate({
      username: values.username.value,
      password: values.password.value,
    }).then(() => {
      onUpdate();
      setVisible(false);
    });
  };
  return (
    <header className="lg:flex lg:items-center lg:justify-between p-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          账户列表
        </h2>
      </div>
      {installed && (
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <span className="sm:ml-3">
            <button
              type="button"
              onClick={onCreateBot}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg
                className="mr-1.5 -ml-0.5 size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
              新建
            </button>
          </span>
        </div>
      )}
      <Modal open={visible}>
        <div
          className={
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 p-6 bg-white rounded-md shadow-lg"
          }
        >
          <div className="flex justify-between">
            <div className="text-lg font-bold text-gray-900">创建账户</div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="text-gray-400"
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M14.95 5.05a.75.75 0 0 1 1.06 1.06L11.06 10l4.95 4.95a.75.75 0 1 1-1.06 1.06L10 11.06l-4.95 4.95a.75.75 0 0 1-1.06-1.06L8.94 10 4.05 5.05a.75.75 0 0 1 1.06-1.06L10 8.94l4.95-4.95Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <form
            className="space-y-6"
            onSubmit={(
              e: React.FormEvent<HTMLFormElement> & {
                target: HTMLFormElement;
              }
            ) => {
              e.preventDefault();
              onSubmit(e.target);
            }}
          >
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                账户
              </label>
              <div className="mt-2">
                <input
                  name="username"
                  id="username"
                  onClick={(e) => e.stopPropagation()}
                  required
                  className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                密码
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  name="password"
                  id="password"
                  onClick={(e) => e.stopPropagation()}
                  required
                  className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                确认密码
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  onClick={(e) => e.stopPropagation()}
                  required
                  className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                创建
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </header>
  );
};

export default Headings;
