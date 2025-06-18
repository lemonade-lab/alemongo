import {createBrowserRouter} from "react-router-dom";
import Home from "./pages/home/App";
import NotRoute from "./pages/404";
import Login from "./pages/login/App";
import Panel from "./pages/home/panel/App";
import Main from "./pages/Main";
import Bots from "./pages/home/Bots/App";
import ButtonTemplate from "./pages/home/Apps/QQBotButtonTemplate/App";
import UpdatePassWord from "./pages/home/UpdatePassWord/App";
import OneBot from "./pages/home/Apps/OneBot/App";
import Settings from "./pages/home/Settings/App";
import Package from "./pages/home/panel/package/App";
import Config from "./pages/home/panel/Conifg/App";
import XtermDate from "./pages/home/panel/xterm-date/App";
import Response from "./pages/home/panel/response/App";
import Packages from "./pages/home/panel/packages/App";
import Account from "./pages/home/Account/App";
import GoBots from "./GoBots";

import ConfigEdit from "./pages/home/configs/create/App";
import Configs from "./pages/home/configs/App";

import SSH from "./pages/home/GitSSH/App";
import SSHUpdate from "./pages/home/GitSSH/Update";
import PackagesMessage from "./pages/home/panel/packages/message/App";
import Apps from "./pages/home/Apps/App";
import AppsNodeJS from "./pages/home/Apps/NodeJS/App";
import GitPackage from "./pages/home/panel/packages/package/App";

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
            element: <GoBots />,
          },
          {
            path: "/bots",
            element: <Bots />,
          },
          {
            path: "/bots/:name",
            element: <Panel />,
          },
          {
            path: "/bots/:name/package",
            element: <Package />,
          },
          {
            path: "/bots/:name/config",
            element: <Config />,
          },
          {
            path: "/bots/:name/xterm-date",
            element: <XtermDate />,
          },
          {
            path: "/bots/:name/response",
            element: <Response />,
          },
          {
            path: "/bots/:name/packages",
            element: <Packages />,
          },
          {
            path: "/bots/:name/packages/:name",
            element: <PackagesMessage />,
          },
          {
            path: "/bots/:name/packages/:name/package",
            element: <GitPackage />,
          },
          {
            path: "/apps",
            element: <Apps />,
          },
          {
            path: "/apps/qqbot-button-template",
            element: <ButtonTemplate />,
          },
          {
            path: "/apps/onebot",
            element: <OneBot />,
          },
          {
            path: "/apps/nodejs",
            element: <AppsNodeJS />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
          {
            path: "/update-password",
            element: <UpdatePassWord />,
          },
          {
            path: "/account",
            element: <Account />,
          },
          {
            path: "/ssh",
            element: <SSH />,
          },
          {
            path: "/ssh/:name",
            element: <SSHUpdate />,
          },
          {
            path: "/ssh/:name/update",
            element: <SSHUpdate />,
          },
          {
            path: "/configs",
            element: <Configs />,
          },
          {
            path: "/configs/:name",
            element: <ConfigEdit />,
          },
          {
            path: "/configs/:name/create",
            element: <ConfigEdit />,
          },
        ],
      },
      {
        path: "*",
        element: <NotRoute />,
      },
    ],
  },
]);
export default router;
