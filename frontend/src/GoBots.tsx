import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
// 如果遇到 / 应该跳转到 /bots
const GoBots = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/bots");
  }, [navigate]);
  return <></>;
};
export default GoBots;
