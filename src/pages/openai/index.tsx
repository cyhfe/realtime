import { Link, Outlet } from "react-router-dom";

function OpenAi() {
  return (
    <div>
      <div>
        <Link to="/openai/chat">聊天</Link>
        <Link to="/openai/images">图片生成</Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default OpenAi;
