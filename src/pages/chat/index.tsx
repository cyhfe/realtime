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
import * as Collapsible from "@radix-ui/react-collapsible";
const ChatContext = createContext(null);
export function useChat() {
  return useContext(ChatContext);
}

function Chat() {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineList, setOnlineList] = useState(null);
  const { user, setOnline } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState(null);
  const messageRef = useRef<HTMLInputElement | null>(null);
  const [to, setTo] = useState(null);
  const [privateMessages, setPrivateMessages] = useState(null);
  const newChannelInputRef = useRef<HTMLInputElement | null>(null);
  const [channels, setChannels] = useState(null);

  useEffect(() => {
    socketRef.current = io(AUTH_BASE_URL + "chat", {
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
      setOnline(true);
      socket.emit("chat/connect", user);
    }

    function onDisconnect() {
      setOnline(false);
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

    function onUpdateChannels(channels: any) {
      setChannels(channels);
    }

    function onUpdateUsers(users: any) {
      setUsers(users);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat/updateOnlineList", onUpdateOnlineList);
    // socket.on("chat/updatePrivateMessages", onUpdatePrivateMessages);
    socket.on("chat/updateChannels", onUpdateChannels);
    socket.on("chat/updateUsers", onUpdateUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat/updateOnlineList", onUpdateOnlineList);
      // socket.off("chat/updatePrivateMessages", onUpdatePrivateMessages);
      socket.off("chat/updateChannels", onUpdateChannels);
      socket.off("chat/updateUsers", onUpdateUsers);
    };
  }, [setOnline, user]);

  useEffect(() => {
    socketRef.current.emit("chat/updateUsers");
    socketRef.current.emit("chat/updateChannels");
  }, []);

  return (
    <ChatContext.Provider value={ctx}>
      <div className="flex ">
        <div className="h-60 basis-60 overflow-hidden border-r-2  border-slate-200 bg-slate-100 p-2 hover:overflow-y-auto">
          <div className="">
            <Collapsible.Root defaultOpen className="mb-2 bg-white ">
              <Collapsible.Trigger
                className="p-2 transition-all data-[state=open]:bg-indigo-500"
                asChild
              >
                <div>在线</div>
              </Collapsible.Trigger>
              <Collapsible.Content className="transition-all">
                {onlineList &&
                  onlineList.map((user: any) => {
                    return (
                      <Link to={`private/${user.id}`} key={user.id}>
                        {user.username}
                        <img
                          className=" h-11 w-11 flex-none rounded-full bg-gray-50"
                          src={user.avatar}
                          alt="avatar"
                        />
                      </Link>
                    );
                  })}
              </Collapsible.Content>
            </Collapsible.Root>
            <Collapsible.Root defaultOpen className="bg-white ">
              <Collapsible.Trigger>
                <div>所有人</div>
              </Collapsible.Trigger>
              <Collapsible.Content className="data-[state=closed]:animate-slideDown data-[state=open]:animate-slideUp">
                {users &&
                  users
                    .filter((u: any) => u.username !== user.username)
                    .map((user: any) => {
                      return (
                        <div key={user.id}>
                          <Link to={`private/${user.id}`}>
                            <img
                              className=" h-11 w-11 flex-none rounded-full bg-gray-50"
                              src={user.avatar}
                              alt="avatar"
                            />
                            {user.username}
                          </Link>
                        </div>
                      );
                    })}
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </div>
        <div className="h-60 basis-60 overflow-hidden  bg-white p-2">
          <div className="">
            <div className="">
              <div>创建频道</div>
              我的频道
              <div>
                {channels &&
                  channels
                    .filter((c: any) => c.userId === user.id)
                    .map((channel: any) => {
                      return (
                        <div key={channel.id}>
                          <Link to={`channel/${channel.id}`}>
                            {channel.name}
                          </Link>
                        </div>
                      );
                    })}
              </div>
              <div>其他频道</div>
              <div>
                {channels &&
                  channels
                    .filter((c: any) => c.userId !== user.id)
                    .map((channel: any) => {
                      return (
                        <div key={channel.id}>
                          <Link to={`channel/${channel.id}`}>
                            {channel.name}
                          </Link>
                        </div>
                      );
                    })}
              </div>
              <div>
                <button
                  onClick={() => {
                    socketRef.current.emit(
                      "chat/createChannel",
                      newChannelInputRef.current.value
                    );
                  }}
                >
                  创建
                </button>
                <input type="text" ref={newChannelInputRef} />
              </div>
            </div>
          </div>
        </div>
        <div className="m-auto basis-auto">
          <Outlet />
        </div>
      </div>
    </ChatContext.Provider>
  );
}

export default Chat;
