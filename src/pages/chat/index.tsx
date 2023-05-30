import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/Auth";
import { Socket, io } from "socket.io-client";
import { getToken, request } from "../../utils";
import { AUTH_BASE_URL } from "../../utils/const";
import { Link, Outlet } from "react-router-dom";

const ChatContext = createContext(null);
export function useChat() {
  return useContext(ChatContext);
}

function Chat() {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineList, setOnlineList] = useState(null);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState(null);
  const messageRef = useRef<HTMLInputElement | null>(null);
  const [to, setTo] = useState(null);
  const [privateMessages, setPrivateMessages] = useState(null);
  const newChanelInputRef = useRef<HTMLInputElement | null>(null);
  const [chanels, setChanels] = useState(null);

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

  const ctx = useMemo(() => {
    return {
      socketRef,
      isConnected,
    };
  }, [isConnected]);

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
      const usersList = JSON.parse(users);
      const usersWithoutSelf = usersList.filter(
        (u: any) => u.username !== user.username
      );
      setOnlineList(usersWithoutSelf);
    }

    function onUpdatePrivateMessages(messages: any) {
      setPrivateMessages(messages);
    }

    function onUpdateChanels(chanels: any) {
      setChanels(chanels);
    }

    function onUpdateUsers(users: any) {
      setUsers(users);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat/updateOnlineList", onUpdateOnlineList);
    // socket.on("chat/updatePrivateMessages", onUpdatePrivateMessages);
    socket.on("chat/updateChanels", onUpdateChanels);
    socket.on("chat/updateUsers", onUpdateUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat/updateOnlineList", onUpdateOnlineList);
      // socket.off("chat/updatePrivateMessages", onUpdatePrivateMessages);
      socket.off("chat/updateChanels", onUpdateChanels);
      socket.off("chat/updateUsers", onUpdateUsers);
    };
  }, [user]);

  useEffect(() => {
    socketRef.current.emit("chat/updateUsers");
    socketRef.current.emit("chat/updateChanels");
  }, []);

  return (
    <ChatContext.Provider value={ctx}>
      <div className="flex">
        <div className="basis-60">
          <div>状态: {isConnected ? "在线" : "离线"}</div>
          <div>
            在线:
            {onlineList &&
              onlineList.map((user: any) => {
                return (
                  <Link to={`private/${user.id}`} key={user.id}>
                    {user.username}
                  </Link>
                );
              })}
          </div>
          <div>
            <div>所有人...</div>
            {users &&
              users
                .filter((u: any) => u.username !== user.username)
                .map((user: any) => {
                  return (
                    <div key={user.id}>
                      <Link to={`private/${user.id}`}>{user.username}</Link>
                    </div>
                  );
                })}
          </div>
        </div>
        <div className="basis-60">
          <div>
            <div>
              <div>创建频道</div>
              我的频道
              <div>
                {chanels &&
                  chanels
                    .filter((c: any) => c.userId === user.id)
                    .map((chanel: any) => {
                      return (
                        <div key={chanel.id}>
                          <Link to={`chanel/${chanel.id}`}>{chanel.name}</Link>
                        </div>
                      );
                    })}
              </div>
              <div>其他频道</div>
              <div>
                {chanels &&
                  chanels
                    .filter((c: any) => c.userId !== user.id)
                    .map((chanel: any) => {
                      return (
                        <div key={chanel.id}>
                          <Link to={`chanel/${chanel.id}`}>{chanel.name}</Link>
                        </div>
                      );
                    })}
              </div>
              <div>
                <button
                  onClick={() => {
                    socketRef.current.emit(
                      "chat/createChanel",
                      newChanelInputRef.current.value
                    );
                  }}
                >
                  创建
                </button>
                <input type="text" ref={newChanelInputRef} />
              </div>
            </div>
          </div>
        </div>
        <div className="basis-auto">
          <Outlet />
        </div>
      </div>
    </ChatContext.Provider>
  );
}

export default Chat;
