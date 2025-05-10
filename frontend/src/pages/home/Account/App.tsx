import Headings from "./Headings";
import Table from "./Table";
import {useEffect, useState} from "react";
import {apiIdentityList} from "@/api/users/identity";

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
 *
 * @returns
 */
const Account = () => {
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
    <>
      <Headings selects={selects} onUpdate={() => onForceUpdate()} />
      {value && <Table selects={selects} />}
    </>
  );
};

export default Account;
