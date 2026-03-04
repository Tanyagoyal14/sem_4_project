import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-64 w-full p-10">
        <Outlet />
      </div>

    </div>
  );
}

export default Layout;