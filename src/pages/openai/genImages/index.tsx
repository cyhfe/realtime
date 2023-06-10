import { Link, Outlet, useMatches } from "react-router-dom";

function GenImages() {
  const matches = useMatches();

  const pathname = matches[1].pathname;

  const isChat = pathname === "/chat";
  const isCanvas = pathname === "/canvas";
  const isMusic = pathname === "/music";
  const isOpenAi = pathname === "/openai";

  return (
    <div className="flex h-full  overflow-y-auto">
      <div className="flex">
        <Link to="/openai/images/generations">生成</Link>
        <Link to="/openai/images/variations">变化</Link>
        <Link to="/openai/images/edit">编辑</Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default GenImages;
