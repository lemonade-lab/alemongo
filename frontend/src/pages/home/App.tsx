import {Outlet} from "react-router-dom";
import SiderMenu from "./SiderMenu";

/**
 * @returns
 */
const Home = () => {
  return (
    <main className="flex flex-1">
      <aside className="flex">
        <SiderMenu />
      </aside>
      <article className="flex-1 flex flex-col">
        <Outlet />
      </article>
    </main>
  );
};

export default Home;