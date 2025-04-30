import {useEffect, useState} from "react";
import {BotInfo} from "../../../api";
import Pagination from "../../../commom/Pagination";

/**
 * @returns
 */
const UserTable = () => {
  // 数据
  const [data, setData] = useState<BotInfo[]>([]);
  const [curData, setCurData] = useState<BotInfo[]>([]);
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
  const initData = () => {};
  useEffect(() => {
    initData();
  }, []);
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 border"></div>
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
