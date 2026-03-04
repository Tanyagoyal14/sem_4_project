import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  History,
  FileText,
  Settings
} from "lucide-react";

function Sidebar() {

  return (

    <div className="w-64 min-h-screen fixed left-0 top-0 bg-black/40 backdrop-blur-xl text-white p-6">

      {/* Logo / Title */}

      <h1 className="text-2xl font-bold mb-12">
        AI Insights
      </h1>

      {/* Navigation */}

      <nav className="flex flex-col gap-6 text-lg">

        <Link
          to="/app/dashboard"
          className="flex items-center gap-3 hover:text-pink-300 transition"
        >
          <LayoutDashboard size={20}/>
          Dashboard
        </Link>


        <Link
          to="/app/analytics"
          className="flex items-center gap-3 hover:text-pink-300 transition"
        >
          <BarChart3 size={20}/>
          Analytics
        </Link>


        <Link
          to="/app/history"
          className="flex items-center gap-3 hover:text-pink-300 transition"
        >
          <History size={20}/>
          Feedback History
        </Link>


        <Link
          to="/app/reports"
          className="flex items-center gap-3 hover:text-pink-300 transition"
        >
          <FileText size={20}/>
          Reports
        </Link>


        <Link
          to="/app/settings"
          className="flex items-center gap-3 hover:text-pink-300 transition"
        >
          <Settings size={20}/>
          Settings
        </Link>

      </nav>

    </div>

  );

}

export default Sidebar;