import clsx from "clsx";
import { Link, Outlet, useMatches } from "react-router-dom";

function GenImages() {
  const matches = useMatches();

  const pathname = matches[3].pathname;

  const isGenerations = pathname === "/openai/images/generations";
  const isVariations = pathname === "/openai/images/variations";
  const isEdit = pathname === "/openai/images/edit";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto p-2 md:container">
        <div className="my-2 flex">
          <Link
            to="/openai/images/generations"
            className={clsx(
              "tansition block rounded-l-full border-r  bg-slate-50    px-4 py-1 text-xs  text-slate-600 shadow",
              isGenerations && "bg-slate-500 text-white"
            )}
          >
            生成
          </Link>
          <Link
            to="/openai/images/variations"
            className={clsx(
              "tansition block border-r bg-slate-50   px-4 py-1 text-xs  text-slate-600 shadow",
              isVariations && "bg-slate-500 text-white"
            )}
          >
            变化
          </Link>
          <Link
            to="/openai/images/edit"
            className={clsx(
              "tansition block rounded-r-full  border-r bg-slate-50   px-4 py-1 text-xs  text-slate-600 shadow",
              isEdit && "bg-slate-500 text-white"
            )}
          >
            编辑
          </Link>
        </div>
        <div className="p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default GenImages;
