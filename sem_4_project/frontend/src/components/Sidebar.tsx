import { Link } from "react-router-dom";
import { LayoutDashboard, BarChart3, Sparkles, Info } from "lucide-react";

function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-10">
        AI Feedback
      </h1>

      <nav className="space-y-6">

        <Link
          to="/"
          className="flex items-center gap-3 hover:text-blue-400 transition"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to="/analytics"
          className="flex items-center gap-3 hover:text-blue-400 transition"
        >
          <BarChart3 size={18} />
          Analytics
        </Link>

        <Link
          to="/cleaning"
          className="flex items-center gap-3 hover:text-blue-400 transition"
        >
          <Sparkles size={18} />
          Cleaning Demo
        </Link>

        <Link
          to="/about"
          className="flex items-center gap-3 hover:text-blue-400 transition"
        >
          <Info size={18} />
          About
        </Link>

      </nav>
    </div>
  );
}

export default Sidebar;