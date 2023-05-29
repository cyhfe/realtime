import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./context/Auth";
export default function Layout() {
  const { logout } = useAuth();
  return (
    <div>
      <Link to="/chat">chat</Link>
      <Link to="/canvas">canvas</Link>
      <button onClick={logout}>logout</button>
      <Outlet />
    </div>
  );
}
