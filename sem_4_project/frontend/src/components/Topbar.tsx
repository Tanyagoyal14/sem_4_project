import { Bell, User } from "lucide-react";

function Topbar() {

  return (

    <div className="flex justify-between items-center mb-8">

      <h1 className="text-3xl font-bold text-white">
        AI Feedback Dashboard
      </h1>

      <div className="flex items-center gap-6 text-white">

        <Bell className="cursor-pointer hover:text-pink-300"/>

        <div className="flex items-center gap-2">
          <User />
          <span>Admin</span>
        </div>

      </div>

    </div>

  );

}

export default Topbar;