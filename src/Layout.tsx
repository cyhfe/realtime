import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./context/Auth";
import { IconCanvas, IconChat, IconLogout, IconMusic } from "./components/icon";
import { Online } from "./components/Online";
import { PropsWithChildren } from "react";
export default function Layout() {
  const { user, logout, online } = useAuth();
  return (
    <Fullscreen>
      <div className="flex h-full flex-col">
        <div className="flex  justify-center border-b-2 border-slate-200 bg-white p-5">
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
                <Online online={online} />
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
        <div className="grow overflow-hidden">
          {/* <div className="h-full w-20  overflow-scroll">
            <div
              style={{
                height: "1000px ",
              }}
            >
              asxs
            </div>
          </div> */}
          <Outlet />
        </div>
      </div>
    </Fullscreen>
  );
}

function Fullscreen({ children }: PropsWithChildren) {
  return (
    <div className="relative flex h-full w-full  overflow-hidden bg-slate-100">
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
