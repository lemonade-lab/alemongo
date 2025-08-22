import {Outlet} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Navbars from "./Navbars";
import {apiInfo} from "@/api";
import {setUserInfo} from "@/redux/me";
const Main = () => {
  const me = useSelector((state: RootState) => state.me);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!me.login) {
      navigate("/login");
      return;
    }
    if (!me.info.username) {
      apiInfo().then((res) => dispatch(setUserInfo(res)));
    }
  }, [me, navigate, dispatch]);
  return (
    <div className="w-screen min-h-screen flex flex-col">
      <Navbars />
      <main className="flex-1 flex flex-row overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Main;
