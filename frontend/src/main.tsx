import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "@/assets/css/index.scss";
import router from "./router";
import {Provider} from "react-redux";
import store from "./redux/index";
import "@ant-design/v5-patch-for-react-19";
import {RouterProvider} from "react-router-dom";
import ThemeProvider from "./provider/ThemeProvider";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);


/**
 * 设计一套在线测试方案
 * alemonjs允许在开发模式中，开放xxx接口。
 * 允许读取文件等。
 */

// 声明全局变量


declare global {
  interface Window {
    socket: WebSocket | null;
    vscode: {
      postMessage: (message: any) => void;
    };
  }
}