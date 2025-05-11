import {useEffect, useState} from "react";
import {User} from "../../../api";
import Pagination from "../../../commom/Pagination";
import {apiUserDelete, apiUserList} from "@/api/users/admin";
import {Button, Popconfirm, Table, TableProps} from "antd";
import {apiIdentityList, apiIdentityUpdate} from "@/api/users/identity";
import Box from "@/commom/Box";
import Headings from "./Headings";

/**
 * 强制刷新 hook
 */
const useForceUpdate = (): [boolean, () => void] => {
  const [value, setValue] = useState(true);
  useEffect(() => {
    if (!value) {
      setValue(true);
    }
  }, [value]);
  const onForceUpdate = () => {
    setValue(false);
  };
  return [value, onForceUpdate];
};

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

  // 更新身份
  const updateIdentity = (item: User, value) => {
    console.log(item, value);
    apiIdentityUpdate({
      username: item.username,
      identity: value,
    }).then(() => {
      // initData();
      // 针对性替换数据。而不是重新请求数据。
      setData((prev) => {
        const index = prev.findIndex((i) => i.username === item.username);
        if (index !== -1) {
          prev[index].identity = value;
        }
        return [...prev];
      });
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
      render: (value, data) => {
        return (
          <select
            className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm "
            value={value}
            onChange={(e) => {
              updateIdentity(data, e.target.value);
            }}
          >
            {selects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        );
      },
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
  const [value, onForceUpdate] = useForceUpdate();
  const [selects, setSelects] = useState<string[]>([]);
  useEffect(() => {
    const getList = async () => {
      const data = await apiIdentityList();
      setSelects(data);
    };
    getList();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-7.75rem)]">
      <Headings selects={selects} onUpdate={() => onForceUpdate()} />
      {value && (
        <>
          <Box>
            <Table pagination={false} columns={columns} dataSource={curData} />
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
        </>
      )}
    </div>
  );
};

export default UserTable;
