import {Outlet} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Navbars from "../commom/Navbars";
import {apiCommonInfo} from "../api";
import {setInfo} from "../redux/info";
const Main = () => {
  const storeLogin = useSelector((state: RootState) => state.login);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!storeLogin.login) {
      navigate("/login");
      return;
    }
  }, [storeLogin.login,navigate]);

  const getInfo = () => {
    apiCommonInfo()
      .then((res) => res.data)
      .then((res) => {
        dispatch(setInfo(res));
      });
  };

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <div className="size-full flex flex-col">
      <Navbars />
      <Outlet />
    </div>
  );
};

export default Main;
