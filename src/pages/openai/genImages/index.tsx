import { Link, Outlet } from "react-router-dom";

function GenImages() {
  return (
    <div className="h-full overflow-y-auto">
      <Link to="/openai/images/generations">生成</Link>
      <Link to="/openai/images/variations">变化</Link>
      <Link to="/openai/images/edit">编辑</Link>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default GenImages;
