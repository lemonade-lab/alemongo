import {apiCommonInfo} from "@/api";
import {RootState} from "@/redux";
import {setInfo} from "@/redux/info";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let status = false;

export const useCommon = () => {
  const info = useSelector((state: RootState) => state.info);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    // 请求接口
    if (loading) {
      if (info.start_at) {
        setLoading(false);
      } else {
        if (status) {
          // 如果已经请求过了，就不再请求
          return;
        }
        status = true;
        // 基本环境信息
        apiCommonInfo()
          .then((res) => res.data)
          .then((res) => {
            dispatch(setInfo(res));
          });
      }
    }
  }, [loading, info, dispatch]);
  const common = {
    loading,
    info,
  };
  return [common] as const;
};
