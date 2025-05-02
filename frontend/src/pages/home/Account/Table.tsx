import {useEffect, useState} from "react";
import {User} from "../../../api";
import Pagination from "../../../commom/Pagination";
import {apiUserDelete, apiUserList} from "@/api/users/admin";
import {Button, Popconfirm, Table, TableProps} from "antd";

/**
 * @returns
 */
const UserTable = () => {
  // 数据
  const [data, setData] = useState<User[]>([]);
  const [curData, setCurData] = useState<User[]>([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: 8,
    total: 0,
  });
  useEffect(() => {
    const start = (pageInfo.page - 1) * pageInfo.pageSize;
    const end = pageInfo.page * pageInfo.pageSize;
    setCurData(data.slice(start, end));
  }, [data, pageInfo.page, pageInfo.pageSize]);
  const initData = () => {
    apiUserList().then((res) => {
      setData(res);
    });
  };
  useEffect(() => {
    initData();
  }, []);

  const onDelete = (item: User) => {
    apiUserDelete({
      username: item.username,
    }).then(() => {
      initData();
    });
  };

  const columns: TableProps<User>["columns"] = [
    {
      title: "昵称",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "identity",
      dataIndex: "identity",
      key: "identity",
    },
    {
      title: "mastername",
      dataIndex: "mastername",
      key: "mastername",
    },
    {
      title: "操作",
      key: "action",
      render: (item) => (
        <div>
          <Popconfirm
            title="危险操作"
            description="你确定要删除这个用户吗?"
            onConfirm={() => onDelete(item)}
            okText="确认"
            cancelText="取消"
          >
            <Button>删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 border">
        <Table
          className="overflow-auto w-screen h-[calc(100vh-22rem)] xl:size-full"
          pagination={false}
          columns={columns}
          dataSource={curData}
        />
      </div>
      <Pagination
        total={pageInfo.total}
        pageSize={pageInfo.pageSize}
        page={pageInfo.page}
        onPageChange={(page) => {
          setPageInfo({
            ...pageInfo,
            page,
          });
        }}
      />
    </div>
  );
};

export default UserTable;
