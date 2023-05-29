import { Link, Outlet } from "react-router-dom";
export default function Layout() {
  return (
    <div>
      <Link to="/chat">chat</Link>
      <Link to="/canvas">canvas</Link>
      layout
      <Outlet />
    </div>
  );
}
