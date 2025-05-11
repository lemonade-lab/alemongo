import {useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Modal from "../../../commom/Modal";
import {apiUserCreate} from "@/api/users/admin";
import {Button, message} from "antd";
import Form from "./Form";

/**
 *
 * @param param0
 * @returns
 */
const Headings = ({
  onUpdate = () => {},
  selects = [],
}: {
  onUpdate: () => void;
  selects: string[];
}) => {
  const [visible, setVisible] = useState(false);
  const installed = useSelector(
    (state: RootState) => state.info.node.installed
  );
  const onCreateBot = () => {
    setVisible(true);
  };

  /**
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
      identity: values.identity.value,
    }).then(() => {
      onUpdate();
      setVisible(false);
    });
  };
  return (
    <header className="lg:flex lg:items-center lg:justify-between p-4">
      <div className="min-w-0 flex-1"></div>
      {installed && (
        <Button type="primary" onClick={onCreateBot}>
          新建
        </Button>
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
          <Form onSubmit={onSubmit} selects={selects} />
        </div>
      </Modal>
    </header>
  );
};

export default Headings;
