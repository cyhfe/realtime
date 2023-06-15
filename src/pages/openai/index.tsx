import clsx from "clsx";
import { Link, Outlet, useMatches } from "react-router-dom";

function OpenAi() {
  const matches = useMatches();
  const pathname = matches[2].pathname;

  const isChat = pathname === "/openai/chat";
  const isImages = pathname === "/openai/images";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center border-b bg-white">
        <div className="my-4 flex text-sm">
          <Link
            to="/openai/chat"
            className={clsx(
              "tansition block rounded-l-full border border-r bg-slate-50  px-4 py-1 font-semibold text-slate-600 text-slate-600 shadow-inner",
              isChat && " bg-slate-600 text-white"
            )}
          >
            聊天
          </Link>
          <Link
            to="/openai/images/generations"
            className={clsx(
              "tansition block rounded-r-full border border-l bg-slate-50  px-4 py-1 font-semibold text-slate-600 text-slate-600 shadow-inner",
              isImages && " bg-slate-600 text-white"
            )}
          >
            图像
          </Link>
        </div>
      </div>
      <div className="grow overflow-hidden bg-slate-50">
        <div className="h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default OpenAi;
