import { useEffect, useState } from "react";
import { User } from "../../../api";
import Pagination from "../../../commom/Pagination";
import { apiUserDelete, apiUserList } from "@/api/users/admin";
import { Button, Popconfirm, Table, TableProps } from "antd";
import { apiIdentityList, apiIdentityUpdate } from "@/api/users/identity";
import Box from "@/commom/Box";
import Headings from "./Headings";

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
    setPageInfo((info) => ({
      ...info,
      total: data.length,
    }));
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

  // 更新身份
  const updateIdentity = (item: User, value) => {
    apiIdentityUpdate({
      username: item.username,
      identity: value,
    }).then(() => {
      // 针对性替换数据，而不是重新请求数据。
      setData((prev) => {
        const index = prev.findIndex((i) => i.username === item.username);
        if (index !== -1) {
          prev[index].identity = value;
        }
        return [...prev];
      });
    });
  };

  const [selects, setSelects] = useState<string[]>([]);
  useEffect(() => {
    const getList = async () => {
      const data = await apiIdentityList();
      setSelects(data);
    };
    getList();
  }, []);

  const columns: TableProps<User>["columns"] = [
    {
      title: (
        <span className="text-gray-900 dark:text-gray-100">昵称</span>
      ),
      dataIndex: "username",
      key: "username",
      render: (value) => (
        <span className="text-gray-900 dark:text-gray-100">{value}</span>
      ),
    },
    {
      title: (
        <span className="text-gray-900 dark:text-gray-100">identity</span>
      ),
      dataIndex: "identity",
      key: "identity",
      render: (value, data) => {
        return (
          <select
            className="w-full border rounded-md bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm transition"
            value={value}
            onChange={(e) => {
              updateIdentity(data, e.target.value);
            }}
          >
            {selects.map((item) => (
              <option key={item} value={item} className="dark:bg-zinc-900 dark:text-gray-100">
                {item}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      title: (
        <span className="text-gray-900 dark:text-gray-100">mastername</span>
      ),
      dataIndex: "mastername",
      key: "mastername",
      render: (value) => (
        <span className="text-gray-900 dark:text-gray-100">{value}</span>
      ),
    },
    {
      title: (
        <span className="text-gray-900 dark:text-gray-100">操作</span>
      ),
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
            <Button danger className="dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700">删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
     <div className="p-2 flex-1 flex flex-col h-[calc(100vh-7.75rem)] bg-slate-100 dark:bg-zinc-900 transition-colors">
       <Headings
        selects={selects}
        onUpdate={() => {
          initData();
        }}
      />
      <Box className="bg-slate-100 dark:bg-zinc-900 transition-colors">
        <Table
          pagination={false}
          columns={columns}
          dataSource={curData}
          className="dark:bg-zinc-900 dark:text-gray-100"
          rowClassName={() => "dark:bg-zinc-900"}
        />
      </Box>
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