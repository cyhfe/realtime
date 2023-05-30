import { useEffect, useRef, useState } from "react";
// import { socket } from "../../socket";
import { useAuth } from "../../context/Auth";
import { Socket, io } from "socket.io-client";
import { getToken, request } from "../../utils";
import { AUTH_BASE_URL } from "../../utils/const";

function Chat() {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineList, setOnlineList] = useState(null);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState(null);

  useEffect(() => {
    socketRef.current = io(AUTH_BASE_URL, {
      autoConnect: false,
      auth: {
        user: JSON.stringify(user),
      },
    });
    const socket = socketRef.current;

    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const socket = socketRef.current;

    function onConnect() {
      setIsConnected(true);
      socket.emit("chat/connect", user);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onUpdateOnlineList(users: any) {
      const usersList = users.map((u: any) => JSON.parse(u));
      const listWithSelf = usersList.filter(
        (u: any) => u.username !== user.username
      );
      console.log(listWithSelf);
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

  useEffect(() => {
    async function getUsers() {
      const res = await request("user", {
        token: getToken(),
      });
      const data = await res.json();

      setUsers(data.users);
    }
    getUsers();
  }, []);

  return (
    <div className="flex">
      <div className="basis-60">
        <div>状态: {isConnected ? "在线" : "离线"}</div>
        <div>
          在线:
          {onlineList &&
            onlineList.map((user: any) => {
              return <div key={user.id}>{user.username}</div>;
            })}
        </div>
        <div>
          <div>所有人...</div>
          {users &&
            users
              .filter((u: any) => u.username !== user.username)
              .map((user: any) => {
                return <div key={user.id}>{user.username}</div>;
              })}
        </div>
      </div>
      <div className="basis-60">
        <div>
          <div>
            我的频道
            <div>创建频道</div>
          </div>

          <div>所有频道</div>
        </div>
      </div>
      <div className="basis-auto">聊天框</div>
    </div>
  );
}

export default Chat;
