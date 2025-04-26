import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "@/assets/css/index.scss";
import router from "./router";
import {Provider} from "react-redux";
import store from "./redux/index";
import "@ant-design/v5-patch-for-react-19";
import {RouterProvider} from "react-router-dom";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
