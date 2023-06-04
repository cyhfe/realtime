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
import { AUTH_BASE_URL } from "../../utils/const";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Online } from "../../components/Online";
import clsx from "clsx";
import { IconClose } from "../../components/icon";
import * as Dialog from "@radix-ui/react-dialog";
import { Toast, ToastHandler } from "../../components/Toast";
import { IChannel, User } from "../../types";

interface ChatContextValue {
  socketRef: React.MutableRefObject<Socket | null>;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw Error("should be used in Provider");
  return ctx;
}

function Chat() {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineList, setOnlineList] = useState<User[] | null>(null);
  const { user, setOnline } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [channels, setChannels] = useState<IChannel[] | null>(null);
  const { toUserId, channelId } = useParams();
  const errorToastRef = useRef<ToastHandler>(null);

  const navagate = useNavigate();

  const ctx = useMemo(() => {
    return {
      socketRef,
      isConnected,
    };
  }, [isConnected]);

  useEffect(() => {
    socketRef.current = io(AUTH_BASE_URL + "chat", {
      autoConnect: false,
      auth: {
        user,
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
    if (!socket || !user) return;
    function onConnect() {
      setIsConnected(true);
      setOnline(true);
      socket?.emit("chat/updateUsers");
      socket?.emit("chat/updateChannels");
    }

    function onDisconnect() {
      setOnline(false);
      setIsConnected(false);
    }

    function onUpdateOnlineList(users: User[]) {
      const usersWithoutSelf = users.filter(
        (u) => u.username !== user?.username
      );
      setOnlineList(usersWithoutSelf);
    }

    function onUpdateChannels(channels: IChannel[]) {
      setChannels(channels);
    }

    function onUpdateUsers(users: User[]) {
      setUsers(users);
    }

    function onError(message: string) {
      errorToastRef.current?.toast({
        title: "服务端错误",
        content: message,
      });
    }

    function onDeleteChannel() {
      console.log("delete");
      navagate("/chat");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat/updateOnlineList", onUpdateOnlineList);
    socket.on("chat/updateChannels", onUpdateChannels);
    socket.on("chat/updateUsers", onUpdateUsers);
    socket.on("deleteChannel", onDeleteChannel);
    socket.on("error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat/updateOnlineList", onUpdateOnlineList);
      socket.off("chat/updateChannels", onUpdateChannels);
      socket.off("chat/updateUsers", onUpdateUsers);
      socket.off("chat/deleteChannel", onDeleteChannel);
      socket.off("error", onError);
    };
  }, [navagate, setOnline, user]);

  const title = clsx("p-2 text-xs text-slate-600");

  if (!user) {
    return null;
  }

  const ownChannel = channels?.filter((c) => c.userId === user.id);
  const otherChanner = channels?.filter((c) => c.userId !== user.id);

  return (
    <ChatContext.Provider value={ctx}>
      <div className="flex h-full w-full">
        <div className=" min-w-min basis-60	 overflow-y-auto overflow-x-hidden  border-r ">
          <div className="text-sm text-slate-600">
            <Collapsible.Root defaultOpen className="mb-2">
              <Collapsible.Trigger className="" asChild>
                <button className={title}>在线</button>
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
                <button className={title}>离线</button>
              </Collapsible.Trigger>
              <Collapsible.Content className="divide-y divide-slate-100">
                {users &&
                  users
                    .filter((u) => {
                      const onlineUsers = onlineList?.map(
                        (online) => online.username
                      );
                      return (
                        !onlineUsers?.includes(u.username) &&
                        u.username !== user.username
                      );
                    })
                    .map((user) => {
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
          <div className="p-2">
            <CreateChannel
              onSubmit={(name) => {
                socketRef.current?.emit("createChannel", name);
              }}
            />
          </div>

          <Collapsible.Root defaultOpen className="mb-2">
            <Collapsible.Trigger className="" asChild>
              <button className={title}>我的频道</button>
            </Collapsible.Trigger>
            <Collapsible.Content className="divide-y divide-slate-100">
              {!ownChannel?.length && (
                <div className="p-2 text-xs text-slate-400">
                  试试去创建一个频道吧
                </div>
              )}
              {ownChannel &&
                ownChannel.map((c: any) => {
                  return (
                    <Channel
                      key={c.id}
                      channel={c}
                      onSubmit={(id) => {
                        socketRef.current?.emit("deleteChannel", id);
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
              {otherChanner &&
                otherChanner.map((c: any) => {
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
      <Toast ref={errorToastRef} />
    </ChatContext.Provider>
  );
}

interface CreateChannelProps {
  onSubmit: (value: string) => void;
}
function CreateChannel({ onSubmit }: CreateChannelProps) {
  const createChannelInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(b) => setOpen(b)}>
      <Dialog.Trigger asChild>
        <button
          onClick={() => setOpen(true)}
          className="rounded border border-slate-50 bg-white px-2 py-1 text-xs  text-slate-500  shadow transition-colors hover:bg-slate-400 hover:text-white	hover:shadow-none"
        >
          <span>创建频道</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed bottom-0 left-0 right-0 top-0 flex items-start justify-center bg-slate-100/50">
          <Dialog.Content asChild>
            <div className="min-w-300 relative top-40 flex flex-col gap-y-4 rounded bg-white p-6 text-base text-slate-600 shadow">
              <Dialog.Title className="text-sm font-medium">
                创建频道
              </Dialog.Title>

              <div className="flex items-center gap-x-3">
                <label className="text-xs text-slate-500" htmlFor="name">
                  频道名
                </label>
                <input
                  className="grow border p-2 text-xs"
                  ref={createChannelInputRef}
                />
              </div>
              <button
                onClick={() => {
                  const value = createChannelInputRef.current?.value;
                  if (!value) {
                    return;
                  }
                  onSubmit(value);
                  setOpen(false);
                }}
                className="rounded bg-blue-400 py-2 text-sm text-white transition-colors hover:bg-blue-500"
              >
                创建
              </button>
              <Dialog.Close className="absolute right-0 top-0 block">
                <div className="mr-4 mt-4 p-2 hover:bg-slate-200">
                  <IconClose className="h-4 w-4" />
                </div>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
interface ChannelProps {
  channel: IChannel;
  onSubmit: (channelId: string) => void;
}

function Channel({ channel, onSubmit }: ChannelProps) {
  const { channelId } = useParams();
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

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <div className="flex items-center px-3 text-slate-300 transition-colors hover:bg-rose-400 hover:text-white">
              <IconClose className="h-4 w-4" />
            </div>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed bottom-0 left-0 right-0 top-0 flex items-start justify-center bg-slate-100/50">
              <Dialog.Content asChild>
                <div className="min-w-300 relative top-40 flex flex-col gap-y-4 rounded bg-white p-6 text-base text-slate-600 shadow">
                  <Dialog.Title className="text-sm font-medium">
                    删除频道
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-400">
                    输入频道名
                    <span className="px-1 text-slate-600">{channel.name} </span>
                    确认删除
                  </Dialog.Description>
                  <div className="flex items-center gap-x-3">
                    <label className="text-xs text-slate-500" htmlFor="name">
                      频道名
                    </label>
                    <input
                      className="grow border p-2 text-xs"
                      ref={deleteChannelInputRef}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (
                        deleteChannelInputRef.current?.value === channel.name
                      ) {
                        onSubmit(channel.id);
                      }
                    }}
                    className="rounded bg-rose-400 py-2 text-sm text-white transition-colors hover:bg-rose-500"
                  >
                    确认删除
                  </button>
                  <Dialog.Close className="absolute right-0 top-0 block">
                    <div className="mr-4 mt-4 p-2 hover:bg-slate-200">
                      <IconClose className="h-4 w-4" />
                    </div>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Overlay>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}

export default Chat;
