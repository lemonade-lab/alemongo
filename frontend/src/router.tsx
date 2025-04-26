import {createBrowserRouter} from "react-router-dom";
import Home from "./pages/home/App";
import NotRoute from "./pages/404";
import Login from "./pages/login/App";
import Panel from "./pages/home/panel/App";
import Main from "./pages/Main";
import Configs from "./pages/home/configs/App";
import Bots from "./pages/home/Bots/App";
import ButtonTemplate from "./pages/home/ButtonTemplate/App";
import UpdatePassWord from "./pages/UpdatePassWord/App";
import OneBot from "./pages/home/OneBot/App";
import Settings from "./pages/Settings/App";
import ConfigEdit from "./pages/home/configs/create/App";
import Package from "./pages/home/panel/pkg/App";
import Config from "./pages/home/panel/Conifg/App";
import XtermDate from "./pages/home/panel/xterm-date/App";
import Response from "./pages/home/panel/response/App";
import Packages from "./pages/home/panel/packages/App";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
        children: [
          {
            path: "/",
            element: <Bots />,
          },
          {
            path: "/configs/list",
            element: <Configs />,
          },
          {
            path: "/configs/create",
            element: <ConfigEdit />,
          },
          {
            path: "/configs/update/:name",
            element: <ConfigEdit />,
          },
          {
            path: "/panel/:name",
            element: <Panel />,
          },
          {
            path: "/panel/:name/package",
            element: <Package />,
          },
          {
            path: "/panel/:name/config",
            element: <Config />,
          },
          {
            path: "/panel/:name/xterm-date",
            element: <XtermDate />,
          },
          {
            path: "/panel/:name/response",
            element: <Response />,
          },
          {
            path: "/panel/:name/packages",
            element: <Packages />,
          },
          {
            path: "button-template",
            element: <ButtonTemplate />,
          },
          {
            path: "/onebot",
            element: <OneBot />,
          },
          {
            path: "/update-password",
            element: <UpdatePassWord />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
        ],
      },
      {
        path: "*",
        element: <NotRoute />,
      },
    ],
  },
  {
    path: "*",
    element: <NotRoute />,
  },
]);
export default router;
