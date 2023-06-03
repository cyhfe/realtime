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
import { Online } from "../../components/Online";
import clsx from "clsx";
import { IconClose } from "../../components/icon";
import * as Dialog from "@radix-ui/react-dialog";

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

  const title = clsx("p-2 text-xs text-slate-600");

  return (
    <ChatContext.Provider value={ctx}>
      <div className="flex h-full w-full">
        <div className=" min-w-min basis-60	 overflow-y-auto overflow-x-hidden  border-r ">
          <div className="text-sm text-slate-600">
            <Collapsible.Root defaultOpen className="mb-2">
              <Collapsible.Trigger className="" asChild>
                <span className={title}>在线</span>
              </Collapsible.Trigger>
              <Collapsible.Content>
                {onlineList && onlineList.length ? (
                  onlineList.map((user: any) => {
                    const isActive = toUserId === user.id;
                    return (
                      <div
                        key={user.id}
                        className={!isActive ? "bg-white" : "bg-slate-200"}
                      >
                        <Link
                          to={`private/${user.id}`}
                          key={user.id}
                          className={clsx(
                            "flex items-center p-3  ",
                            !isActive && "hover:bg-slate-50"
                          )}
                        >
                          <img
                            className=" h-11 w-11 flex-none rounded-full bg-gray-50"
                            src={user.avatar}
                            alt="avatar"
                          />
                          <div className="ml-4 flex flex-col ">
                            <div>{user.username}</div>
                            <Online online />
                          </div>
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 text-xs text-slate-400">
                    暂时没有在线用户,试试给离线用户发送消息吧!
                  </div>
                )}
              </Collapsible.Content>
            </Collapsible.Root>
            <Collapsible.Root defaultOpen>
              <Collapsible.Trigger asChild>
                <span className={title}>离线</span>
              </Collapsible.Trigger>
              <Collapsible.Content className="divide-y divide-slate-100">
                {users &&
                  users
                    .filter(
                      (u: any) =>
                        !onlineList.find((o: any) => o.username === u.username)
                    )
                    .map((user: any) => {
                      const isActive = toUserId === user.id;

                      return (
                        <div
                          key={user.id}
                          className={!isActive ? "bg-white" : "bg-slate-200"}
                        >
                          <Link
                            to={`private/${user.id}`}
                            key={user.id}
                            className={clsx(
                              "flex items-center p-3  ",
                              !isActive && "hover:bg-slate-50"
                            )}
                          >
                            <img
                              className="h-11 w-11 flex-none rounded-full bg-gray-50 brightness-50"
                              src={user.avatar}
                              alt="avatar"
                            />
                            <div className="ml-4 flex flex-col ">
                              <div>{user.username}</div>
                              <Online />
                            </div>
                          </Link>
                        </div>
                      );
                    })}
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </div>
        <div className=" min-w-min basis-60	 overflow-y-auto overflow-x-hidden  border-r  ">
          <Collapsible.Root defaultOpen className="mb-2">
            <Collapsible.Trigger className="" asChild>
              <button className={title}>我的频道</button>
            </Collapsible.Trigger>
            <Collapsible.Content className="divide-y divide-slate-100">
              {channels &&
                channels
                  .filter((c: any) => c.userId === user.id)
                  .map((c: any) => {
                    return (
                      <Channel
                        channel={c}
                        channelId={channelId}
                        onSubmit={(id) => {
                          socketRef.current.emit("deleteChannel", id);
                        }}
                      />
                    );
                  })}
            </Collapsible.Content>
          </Collapsible.Root>
          <Collapsible.Root defaultOpen className="mb-2">
            <Collapsible.Trigger className="" asChild>
              <button className={title}>其他频道</button>
            </Collapsible.Trigger>
            <Collapsible.Content className="divide-y divide-slate-100">
              {channels &&
                channels
                  .filter((c: any) => c.userId !== user.id)
                  .map((c: any) => {
                    const isActive = c.id === channelId;
                    return (
                      <div
                        key={c.id}
                        className={!isActive ? "bg-white" : "bg-slate-200"}
                      >
                        <Link
                          to={`channel/${c.id}`}
                          className={clsx(
                            "flex items-center p-3 text-xs text-slate-600",
                            !isActive && "hover:bg-slate-50"
                          )}
                        >
                          # {c.name}
                        </Link>
                      </div>
                    );
                  })}
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
        <div className="overflow-x-hidde flex grow items-center justify-center">
          <div className="bg-slate-150 h-full w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </ChatContext.Provider>
  );
}

interface ChannelProps {
  channel: any;
  channelId: string;
  onSubmit: (channelId: string) => void;
}

function Channel({ channel, channelId, onSubmit }: ChannelProps) {
  const isActive = channel.id === channelId;
  const deleteChannelInputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div key={channel.id} className={!isActive ? "bg-white" : "bg-slate-200"}>
      <div className={clsx("flex", !isActive && "hover:bg-slate-50")}>
        <Link
          to={`channel/${channel.id}`}
          className={clsx("flex grow items-center p-3 text-xs text-slate-600")}
        >
          # {channel.name}
        </Link>
        <div className=" flex items-center px-3 text-slate-300 hover:bg-rose-400 hover:text-white">
          <Dialog.Root>
            <Dialog.Trigger>
              <IconClose className="h-4 w-4" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-slate-100/50">
                <Dialog.Content className="min-w-300 relative flex flex-col gap-y-4 rounded bg-white p-6 text-base text-slate-600 shadow">
                  <Dialog.Title className="text-lg font-medium">
                    删除频道
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-slate-300">
                    输入频道名
                    <span className="px-1 text-slate-600">{channel.name} </span>
                    确认删除
                  </Dialog.Description>
                  <div className="flex items-center gap-x-3">
                    <label className="text-slate-500" htmlFor="name">
                      频道名
                    </label>
                    <input
                      className="grow border p-1"
                      ref={deleteChannelInputRef}
                    />
                  </div>
                  <button
                    onClick={() => {
                      console.log(
                        deleteChannelInputRef.current.value,
                        channel.name
                      );
                      if (
                        deleteChannelInputRef.current.value === channel.name
                      ) {
                        onSubmit(channel.id);
                      }
                    }}
                    className="rounded bg-rose-400 py-2 text-white transition-colors hover:bg-rose-500"
                  >
                    确认删除
                  </button>
                  <Dialog.Close className="absolute right-0 top-0 p-6">
                    <IconClose className="h-4 w-4" />
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Overlay>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </div>
  );
}

export default Chat;
