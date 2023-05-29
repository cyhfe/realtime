import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { useAuth } from "../../context/Auth";
import { Socket, io } from "socket.io-client";
const URL = process.env.AUTH_ENDPOINT;

function Chat() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineList, setOnlineList] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      socket.emit("chat/connect", user);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onUpdateOnlineList(data: any) {
      const list = JSON.parse(data);
      console.log(list);

      const listWithSelf = list.filter(
        (u: any) => u.username !== user.username
      );
      setOnlineList(listWithSelf);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat/updateOnlineList", onUpdateOnlineList);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat/updateOnlineList", onUpdateOnlineList);
    };
  }, [user]);

  return (
    <div className="flex">
      <div className="basis-60">
        <div>状态: {isConnected ? "在线" : "离线"}</div>
        <div>好友列表: ...</div>
        <div>
          在线列表: ...
          {onlineList &&
            onlineList.map((user: any) => {
              return <div key={user.id}>{user.username}</div>;
            })}
        </div>
      </div>
      <div className="basis-60">频道</div>
      <div className="basis-auto">聊天框</div>
    </div>
  );
}

export default Chat;
