import {
  Link,
  Outlet,
  useLocation,
  useMatch,
  useMatches,
  useParams,
} from "react-router-dom";
import { useAuth } from "./context/Auth";
import { IconCanvas, IconChat, IconLogout, IconMusic } from "./components/icon";
import { Online } from "./components/Online";
import { PropsWithChildren } from "react";
import clsx from "clsx";
export default function Layout() {
  const { user, logout, online } = useAuth();
  const matches = useMatches();

  const pathname = matches[1].pathname;
  const isChat = pathname === "/chat";
  const isCanvas = pathname === "/canvas";
  const isMusic = pathname === "/music";
  return (
    <Fullscreen>
      <div className="flex h-full flex-col">
        <div className="flex  justify-center border-b  bg-white ">
          <div className="flex w-full justify-between">
            <div className="flex text-slate-500">
              <Link
                to="/chat"
                className={clsx(
                  "block  p-4",
                  isChat && "bg-slate-200 text-slate-800"
                )}
              >
                <IconChat />
              </Link>
              <Link
                to="/canvas"
                className={clsx(
                  "block  p-4",
                  isCanvas && "bg-slate-200 text-slate-800"
                )}
              >
                <IconCanvas />
              </Link>
              <Link
                to="/music"
                className={clsx(
                  "block  p-4",
                  isMusic && "bg-slate-200 text-slate-900"
                )}
              >
                <IconMusic className="" />
              </Link>
            </div>
            <div className="flex gap-x-3">
              <div className="flex">
                <div>{user.username}</div>
                <Online online={online} />
                <img
                  className="block h-10 w-10 flex-none rounded-full bg-gray-50"
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
          <Outlet />
        </div>
      </div>
    </Fullscreen>
  );
}

function Fullscreen({ children }: PropsWithChildren) {
  return (
    <div className="relative flex h-full w-full  overflow-hidden bg-slate-100 text-base text-slate-600">
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
