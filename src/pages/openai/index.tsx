import { Link, Outlet } from "react-router-dom";

function OpenAi() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center border-b bg-white">
        <div className="my-4 flex text-sm">
          <Link
            to="/openai/chat"
            className="block rounded-l-full border-r bg-slate-600 px-4 py-1  font-semibold text-white shadow"
          >
            聊天
          </Link>
          <Link
            to="/openai/images/generations"
            className="block rounded-r-full bg-white px-4 py-1 font-semibold  text-slate-600 shadow"
          >
            图像
          </Link>
        </div>
      </div>
      <div className="grow overflow-hidden bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
}

export default OpenAi;
