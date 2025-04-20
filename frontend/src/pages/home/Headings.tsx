import {useState} from "react";
import {apiBotCreate} from "../../api";
import {message} from "antd";
import {useSelector} from "react-redux";
import {RootState} from "../../redux";
import Modal from "../../commom/Modal";
// import {useNavigate} from "react-router-dom";

const Headings = ({onUpdate}: {onUpdate: () => void}) => {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const installed = useSelector(
    (state: RootState) => state.info.node.installed
  );
  const onCreateBot = () => {
    setVisible(true);
  };
  const info = useSelector((state: RootState) => state.info);
  /**
   *
   * @param e
   * @returns
   */
  const onSubmit = (values: HTMLFormElement) => {
    // fetch data
    const name = values.botname.value;
    // 英文，数字，下划线
    const reg = /^[a-zA-Z0-9_]+$/;
    if (!reg.test(name)) {
      message.error("机器人名称只能包含英文，数字，下划线");
      return;
    }
    apiBotCreate({
      name,
    }).then((res) => {
      console.log("res", res);
      // onCreate(name);
      setVisible(false);
      onUpdate();
    });
  };
  return (
    <div className="lg:flex lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          机器人列表
        </h2>
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg
              className="mr-1.5 size-5 shrink-0 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z"
                clipRule="evenodd"
              />
              <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
            </svg>
            NodeJS {info.node.installed ? info.node.version : "未安装"}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg
              className="mr-1.5 size-5 shrink-0 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                clipRule="evenodd"
              />
            </svg>
            {info.location}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg
              className="mr-1.5 size-5 shrink-0 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                clipRule="evenodd"
              />
            </svg>
            {info.start_at}
          </div>
        </div>
      </div>
      {installed && (
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          {/* <span className="hidden sm:block">
            <button
              type="button"
              onClick={() => onGoConfig()}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
            >
              <svg
                className="mr-1.5 -ml-0.5 size-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
              </svg>
              配置
            </button>
          </span> */}
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
          <div className="relative ml-3 sm:hidden">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:ring-gray-400"
              onClick={() => setShow(!show)}
            >
              更多
              <svg
                className="-mr-1 ml-1.5 size-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {show && (
              <div className="absolute right-0 z-10 mt-2 -mr-1 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 focus:outline-hidden">
                <a className="block px-4 py-2 text-sm text-gray-700">编辑</a>
                {/* <a className="block px-4 py-2 text-sm text-gray-700">查看</a> */}
              </div>
            )}
          </div>
        </div>
      )}
      <Modal open={visible}>
        <div
          className={
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 p-6 bg-white rounded-md shadow-lg"
          }
        >
          <div className="flex justify-between">
            <div className="text-lg font-bold text-gray-900">创建机器人</div>
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
                机器人昵称
              </label>
              <div className="mt-2">
                <input
                  type="botname"
                  name="botname"
                  id="botname"
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
    </div>
  );
};

export default Headings;
