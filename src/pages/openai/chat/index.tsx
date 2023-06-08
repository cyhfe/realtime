import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Conversation } from "../../../types";
import axios from "axios";
import { BASE_URL } from "../../../utils/const";
import { useAuth } from "../../../context/Auth";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
function Chat() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation[] | null>(null);

  useEffect(() => {
    if (!user) return;
    async function getConvarsation() {
      const token = getToken() ?? undefined;
      const res = await requestApi({
        method: "get",
        endPoint: "conversation",
        token,
      });
      if (res.statusText === "OK") {
        const { conversations } = res.data;
        setConversation(conversations);
      }
    }
    getConvarsation();
  }, [user]);

  return (
    <div className="flex">
      <div>
        <button>创建对话</button>
        <div>对话列表</div>
        <div>
          {conversation &&
            conversation.map((item) => {
              return <div key={item.id}>{item.name}</div>;
            })}
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default Chat;
