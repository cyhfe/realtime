import { Link, Outlet, useMatches } from "react-router-dom";
import { useAuth } from "./context/Auth";
import { IconCanvas, IconChat, IconLogout, IconMusic } from "./components/icon";
import { Online } from "./components/Online";
import { PropsWithChildren } from "react";
import { SiOpenai } from "react-icons/si";
import clsx from "clsx";
export default function Layout() {
  const { user, logout, online } = useAuth();
  const matches = useMatches();

  const pathname = matches[1].pathname;
  const isChat = pathname === "/chat";
  const isCanvas = pathname === "/canvas";
  const isMusic = pathname === "/music";
  const isOpenAi = pathname === "/openai";

  if (!user) return null;

  return (
    <Fullscreen>
      <div className="flex h-full flex-col">
        <div className="flex  justify-center border-b  bg-white ">
          <div className="flex w-full justify-between">
            <div className="flex text-slate-500 ">
              <Link
                to="/openai"
                className={clsx(
                  "block  p-4",
                  isOpenAi && "bg-slate-300 text-slate-800",
                  !isOpenAi && "hover:bg-slate-200"
                )}
              >
                <SiOpenai className="h-6 w-6" />
              </Link>
              <Link
                to="/chat"
                className={clsx(
                  "block  p-4",
                  isChat && "bg-slate-300 text-slate-800",
                  !isChat && "hover:bg-slate-200"
                )}
              >
                <IconChat />
              </Link>
              <Link
                to="/canvas"
                className={clsx(
                  "block  p-4",
                  isCanvas && "bg-slate-300 text-slate-800",
                  !isCanvas && "hover:bg-slate-200"
                )}
              >
                <IconCanvas />
              </Link>
              <Link
                to="/music"
                className={clsx(
                  "block  p-4 ",
                  isMusic && "bg-slate-300 text-slate-900",
                  !isMusic && "hover:bg-slate-200"
                )}
              >
                <IconMusic />
              </Link>
            </div>
            <div className="mr-8 flex items-center gap-x-3">
              <img
                className="block h-9 w-9 flex-none rounded-full bg-gray-50"
                src={user.avatar}
                alt="avatar"
              />
              <div className="flex flex-col items-start">
                <div className="text-sm">{user.username}</div>
                {(isChat || isCanvas) && <Online online={online} />}
              </div>

              <button
                onClick={logout}
                className="block  p-4 text-slate-800 hover:bg-slate-300"
              >
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
