import { Link, Outlet } from "react-router-dom";

function GenImages() {
  return (
    <div>
      <Link to="/openai/images/generations">生成</Link>
      <Link to="/openai/images/variations">变化</Link>
      <Link to="/openai/images/edit">编辑</Link>
      <Outlet />
    </div>
  );
}

export default GenImages;
