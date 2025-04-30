import {Outlet} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Navbars from "./Navbars";
import {apiCommonInfo, apiInfo} from "../api";
import {setInfo} from "../redux/info";
import {setUserInfo} from "@/redux/meInfo";
const Main = () => {
  const storeLogin = useSelector((state: RootState) => state.login);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!storeLogin.login) {
      navigate("/login");
      return;
    }
    apiCommonInfo()
      .then((res) => res.data)
      .then((res) => {
        dispatch(setInfo(res));
      });
    // 获得 info
    apiInfo().then((res) => {
      dispatch(setUserInfo(res.data));
    });
  }, [storeLogin.login, navigate, dispatch]);
  return (
    <div className="size-full flex flex-col">
      <Navbars />
      <Outlet />
    </div>
  );
};

export default Main;
