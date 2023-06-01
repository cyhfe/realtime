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
import { Link, Outlet, useParams } from "react-router-dom";
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
  const { toUserId, channelId } = useParams();

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

    function onUpdateChannels(channels: any) {
      setChannels(channels);
    }

    function onUpdateUsers(users: any) {
      setUsers(users);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat/updateOnlineList", onUpdateOnlineList);
    socket.on("chat/updateChannels", onUpdateChannels);
    socket.on("chat/updateUsers", onUpdateUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat/updateOnlineList", onUpdateOnlineList);
      socket.off("chat/updateChannels", onUpdateChannels);
      socket.off("chat/updateUsers", onUpdateUsers);
    };
  }, [setOnline, user]);

  useEffect(() => {
    socketRef.current.emit("chat/updateUsers");
    socketRef.current.emit("chat/updateChannels");
  }, []);

  const title = "p-2 text-xs text-slate-600";

  return (
    <ChatContext.Provider value={ctx}>
      <div className="flex ">
        <div className="h-96 basis-60  overflow-y-auto  border-r-2 border-slate-200 ">
          <div className="text-sm">
            <Collapsible.Root defaultOpen className="mb-2">
              <Collapsible.Trigger className="" asChild>
                <button className={title}>在线</button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                {onlineList &&
                  onlineList.map((user: any) => {
                    return (
                      <div
                        className={
                          toUserId !== user.id ? "bg-white" : "bg-slate-300"
                        }
                      >
                        <Link
                          to={`private/${user.id}`}
                          key={user.id}
                          className="flex
                          items-center
                          p-3
                          "
                        >
                          <img
                            className=" h-11 w-11 flex-none rounded-full bg-gray-50"
                            src={user.avatar}
                            alt="avatar"
                          />
                          <div className="ml-2 flex flex-col ">
                            <div>{user.username}</div>
                            <div>online</div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
              </Collapsible.Content>
            </Collapsible.Root>
            <Collapsible.Root defaultOpen>
              <Collapsible.Trigger>
                <button className={title}>离线</button>
              </Collapsible.Trigger>
              <Collapsible.Content className="divide-y divide-slate-100">
                {users &&
                  users
                    .filter(
                      (u: any) =>
                        !onlineList.find((o: any) => o.username === u.username)
                    )
                    .map((user: any) => {
                      return (
                        <div
                          className={
                            toUserId !== user.id ? "bg-white" : "bg-slate-300"
                          }
                        >
                          <Link
                            to={`private/${user.id}`}
                            key={user.id}
                            className="flex
                          items-center
                          p-3
                          "
                          >
                            <img
                              className=" h-11 w-11 flex-none rounded-full bg-gray-50"
                              src={user.avatar}
                              alt="avatar"
                            />
                            <div className="ml-2 flex flex-col ">
                              <div>{user.username}</div>
                              <div>online</div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </div>
        <div className="h-96 basis-60  overflow-y-auto  border-r-2 border-slate-200 ">
          <Collapsible.Root defaultOpen className="mb-2">
            <Collapsible.Trigger className="" asChild>
              <button className={title}>我的频道</button>
            </Collapsible.Trigger>
            <Collapsible.Content className="">
              {channels &&
                channels
                  .filter((c: any) => c.userId === user.id)
                  .map((c: any) => {
                    return (
                      <div
                        key={c.id}
                        className={
                          c.id !== channelId ? "bg-white" : "bg-slate-300"
                        }
                      >
                        <Link
                          to={`channel/${c.id}`}
                          className="block p-2 text-sm text-slate-700"
                        >
                          # {c.name}
                        </Link>
                      </div>
                    );
                  })}
            </Collapsible.Content>
          </Collapsible.Root>
          <Collapsible.Root defaultOpen className="mb-2">
            <Collapsible.Trigger className="" asChild>
              <button className={title}>其他频道</button>
            </Collapsible.Trigger>
            <Collapsible.Content className="overflow-x-hidden">
              {channels &&
                channels
                  .filter((c: any) => c.userId !== user.id)
                  .map((c: any) => {
                    return (
                      <div
                        key={c.id}
                        className={
                          c.id !== channelId ? "bg-white" : "bg-slate-300"
                        }
                      >
                        <Link
                          to={`channel/${c.id}`}
                          className="block p-2 text-sm text-slate-700"
                        >
                          # {c.name}
                        </Link>
                      </div>
                    );
                  })}
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
        <div className="m-auto basis-auto">
          <Outlet />
        </div>
      </div>
    </ChatContext.Provider>
  );
}

export default Chat;
