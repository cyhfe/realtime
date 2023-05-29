import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./context/Auth";
export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="h-screen  w-full bg-slate-100">
      <div className="flex justify-center  bg-white p-5">
        <div className="container flex justify-between">
          <div className="flex gap-x-3">
            <Link to="/chat">chat</Link>
            <Link to="/canvas">canvas</Link>
          </div>
          <div className="flex gap-x-3">
            <div>{user.username}</div>
            <button onClick={logout}>logout</button>
          </div>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
