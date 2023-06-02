import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useChat } from ".";
import { Online } from "../../components/Online";
import { useAuth } from "../../context/Auth";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
function noop() {}

function ChatIndex() {
  return <div>请选择一个用户或者频道开始聊天吧!</div>;
}

function ChatChannel() {
  const { channelId } = useParams();
  const [channelMessages, setChannelMessages] = useState(null);
  const [channel, setChannel] = useState(null);
  const [users, setUsers] = useState(null);
  const { socketRef, isConnected } = useChat();
  const messageRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;

    function onGetChannel(channel: any) {
      setChannel(channel);
    }
    function onUpdateChannelMessages(message: any) {
      setChannelMessages(message);
    }
    function onUpdateChannelUsers(users: any) {
      setUsers(users);
    }

    socket.on("chat/getChannel", onGetChannel);
    socket.on("chat/updateChannelMessages", onUpdateChannelMessages);
    socket.on("chat/updateChannelUsers", onUpdateChannelUsers);

    return () => {
      socket.off("chat/getChannel", onGetChannel);
      socket.off("chat/updateChannelMessages", onUpdateChannelMessages);
      socket.off("chat/updateChannelUsers", onUpdateChannelUsers);
    };
  }, [socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;
    socket.emit("chat/getChannel", channelId);
    socket.emit("chat/enterChannel", channelId);

    return () => {
      socket.emit("chat/leaveChannel", channelId);
    };
  }, [channelId, socketRef]);

  if (!isConnected) {
    return <Navigate to="/chat"></Navigate>;
  }

  return (
    <div>
      <div>频道名{channel && channel.name}</div>
      <div>
        当前频道用户
        {users &&
          users.map((user: any) => {
            return <div>{user.username}</div>;
          })}
      </div>
      <div>聊天内容</div>
      <div>
        {channelMessages &&
          channelMessages.map((m: any) => {
            return <div>{m.content}</div>;
          })}
      </div>
      <div>
        <div className="col-span-full">
          <label
            htmlFor="about"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            About
          </label>
          <div className="mt-2">
            <textarea
              id="about"
              name="about"
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            ></textarea>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Write a few sentences about yourself.
          </p>
        </div>
        <button
          onClick={() => {
            socketRef.current.emit("chat/channelMessage", {
              channelId,
              content: messageRef.current.value,
            });
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}

function ChatPrivate() {
  const { toUserId } = useParams();
  const { socketRef, isConnected } = useChat();
  const [privateMessages, setPrivateMessages] = useState([]);
  const [toUser, setToUser] = useState(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const { user } = useAuth();
  const messageBoxRef = useRef<HTMLDivElement>(null);

  function scrollToTop() {
    messageBoxRef.current.scrollTo(0, messageBoxRef.current.scrollHeight);
  }

  useLayoutEffect(() => {
    if (!privateMessages || !privateMessages.length) return;
    scrollToTop();
  }, [privateMessages]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;
    socket.emit("chat/updatePrivateMessages", toUserId);
  }, [socketRef, toUserId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;
    function onNewPrivateMessage(message: any) {
      setPrivateMessages((messages) => [...messages, message]);
    }
    function onUpdatePrivateMessages(messages: any) {
      setPrivateMessages(messages);
    }
    function onUpdateToUser(toUser: any) {
      setToUser(toUser);
    }
    socket.emit("updatePrivateMessages", toUserId);
    socket.emit("updateToUser", toUserId);

    socket.on("updatePrivateMessages", onUpdatePrivateMessages);
    socket.on("chat/newPrivateMessage", onNewPrivateMessage);
    socket.on("updateToUser", onUpdateToUser);
    return () => {
      socket.off("chat/newPrivateMessage", onNewPrivateMessage);
    };
  }, [socketRef, toUserId]);

  if (!isConnected) {
    return <Navigate to="/chat"></Navigate>;
  }

  function renderMessages() {
    if (!privateMessages || !privateMessages.length) return null;

    return (
      <div className="px-6 py-4">
        {privateMessages.map((m: any) => {
          const owner = m.fromUserId === user.id;

          return owner ? (
            <div key={m.id} className={"mb-6 flex justify-end"}>
              <div className="flex gap-x-4">
                <div className="flex flex-col items-end overflow-hidden">
                  <div className="mb-2">
                    <span className="pr-2 text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleString("zh-CN")}
                    </span>
                    <span className="text-md  text-slate-500">
                      {m.from.username}
                    </span>
                  </div>
                  {/* <div className="prose prose-slate">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div> */}
                  <div className="text-md max-w-prose rounded bg-white p-2  text-slate-700  shadow">
                    <div className="prose ">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                <img
                  className="h-8 w-8 flex-none rounded-full bg-gray-50"
                  src={m.from.avatar}
                  alt="avatar"
                />
              </div>
            </div>
          ) : (
            <div key={m.id} className={"mb-6 flex justify-start"}>
              <div className="flex gap-x-4">
                <img
                  className="h-8 w-8 flex-none rounded-full bg-gray-50"
                  src={m.from.avatar}
                  alt="avatar"
                />
                <div className="flex flex-col items-start overflow-hidden">
                  <div className="mb-2">
                    <span className="text-md  text-slate-500">
                      {m.from.username}
                    </span>
                    <span className="pl-2 text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>

                  <div className="text-md max-w-prose rounded bg-white px-3 py-2  text-slate-700  shadow">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 grow-0 basis-auto border-b bg-white">
        {toUser && (
          <div className="flex items-center p-3">
            <img
              className="h-10 w-10 flex-none rounded-full bg-gray-50 "
              src={toUser.avatar}
              alt="avatar"
            />
            <div className="text-md ml-2">{toUser.username}</div>
          </div>
        )}
      </div>
      <div className="flex grow flex-col overflow-hidden">
        <div className="grow overflow-y-auto" ref={messageBoxRef}>
          {renderMessages()}
        </div>
        <div className="shrink-0 grow-0 basis-auto bg-white">
          {/* <textarea ref={messageRef} /> */}
          <div className="p-2">
            <textarea
              ref={messageRef}
              id="about"
              name="about"
              rows={1}
              placeholder="enter 发送 ctrl enter 换行"
              className="unset p=2 block h-24 w-full text-sm placeholder:text-slate-400"
            ></textarea>
            <button
              onClick={() => {
                socketRef.current?.emit("chat/privateMessage", {
                  content: messageRef.current.value,
                  to: toUserId,
                });
              }}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ChatIndex, ChatChannel, ChatPrivate };
