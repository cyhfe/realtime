import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./context/Auth";
import { IconCanvas, IconChat, IconLogout, IconMusic } from "./components/icon";
export default function Layout() {
  const { user, logout, online } = useAuth();
  return (
    <div className="h-screen  w-full divide-y bg-slate-100">
      <div className="flex justify-center   bg-white p-5">
        <div className="container flex justify-between">
          <div className="flex gap-x-3">
            <Link to="/chat">
              chat
              <IconChat />
            </Link>
            <Link to="/canvas">
              canvas
              <IconCanvas />
            </Link>

            <Link to="/music">
              music
              <IconMusic />
            </Link>
          </div>
          <div className="flex gap-x-3">
            <div className="flex">
              <div>{user.username}</div>
              <div>{online ? 1 : 2}</div>
              <img
                className=" h-11 w-11 flex-none rounded-full bg-gray-50"
                src={user.avatar}
                alt="avatar"
              />
            </div>
            <button onClick={logout}>
              <IconLogout />
            </button>
          </div>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
