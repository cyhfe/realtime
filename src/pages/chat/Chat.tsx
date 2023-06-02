import {
  PropsWithChildren,
  ReactNode,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
import { IconSend } from "../../components/icon";
function noop() {}

function ChatIndex() {
  return <div>请选择一个用户或者频道开始聊天吧!</div>;
}

function ChatChannel() {
  const { channelId } = useParams();
  const [channelMessages, setChannelMessages] = useState([]);
  const [channel, setChannel] = useState(null);
  const [users, setUsers] = useState([]);
  const { socketRef, isConnected } = useChat();
  const messageBoxRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  function onSendMessage(content: string) {
    socketRef.current.emit("chat/channelMessage", {
      channelId,
      content,
    });
  }

  useEffect(() => {
    if (!channelMessages || !channelMessages.length) return;
    function scrollToTop() {
      messageBoxRef.current?.scrollTo(0, messageBoxRef.current.scrollHeight);
    }
    scrollToTop();
  }, [channelMessages]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;

    function onGetChannel(channel: any) {
      setChannel(channel);
    }
    function onUpdateChannelMessages(messages: any) {
      setChannelMessages(messages);
    }
    function onUpdateChannelMessage(message: any) {
      setChannelMessages((prev) => [...prev, message]);
    }
    function onUpdateChannelUsers(users: any) {
      console.log(users);
      setUsers(users);
    }

    socket.on("chat/getChannel", onGetChannel);
    socket.on("chat/updateChannelMessages", onUpdateChannelMessages);
    socket.on("chat/updateChannelMessage", onUpdateChannelMessage);
    socket.on("chat/updateChannelUsers", onUpdateChannelUsers);

    return () => {
      socket.off("chat/getChannel", onGetChannel);
      socket.off("chat/updateChannelMessages", onUpdateChannelMessages);
      socket.off("chat/updateChannelMessage", onUpdateChannelMessage);
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

  if (!channel) return null;

  return (
    <MessageContainer>
      <MessageHeader>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-x-3 text-sm">
            {channel.name}
            <div className="flex -space-x-2 overflow-hidden">
              {users.map((user: any) => {
                return (
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    src={user.avatar}
                    alt="avatar"
                  />
                );
              })}
            </div>
          </div>
          <div>
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              频道当前人数 {users.length}
            </span>
          </div>
        </div>
      </MessageHeader>
      <MessageBody>
        <MessageBox ref={messageBoxRef}>
          {channelMessages.map((message: any) => {
            const owner = message.fromUserId === user.id;
            const avatar = message.from.avatar;
            const username = message.from.username;
            const { content, createdAt } = message;

            return (
              <Message
                key={message.id}
                avatar={avatar}
                owner={owner}
                content={content}
                createdAt={createdAt}
                username={username}
              />
            );
          })}
        </MessageBox>
        <SendMessage onSubmit={onSendMessage} />
      </MessageBody>
    </MessageContainer>
  );
  // return (
  //   <div>

  //     <div>聊天内容</div>
  //     <div>
  //       {channelMessages &&
  //         channelMessages.map((m: any) => {
  //           return <div>{m.content}</div>;
  //         })}
  //     </div>
  //     <div>
  //       <div className="col-span-full">
  //         <label
  //           htmlFor="about"
  //           className="block text-sm font-medium leading-6 text-gray-900"
  //         >
  //           About
  //         </label>
  //         <div className="mt-2">
  //           <textarea
  //             id="about"
  //             name="about"
  //             rows={3}
  //             className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
  //           ></textarea>
  //         </div>
  //         <p className="mt-3 text-sm leading-6 text-gray-600">
  //           Write a few sentences about yourself.
  //         </p>
  //       </div>
  //       <button
  //         onClick={() => {
  //           socketRef.current.emit("chat/channelMessage", {
  //             channelId,
  //             content: messageRef.current.value,
  //           });
  //         }}
  //       >
  //         发送
  //       </button>
  //     </div>
  //   </div>
  // );
}

function ChatPrivate() {
  const { toUserId } = useParams();
  const { socketRef, isConnected } = useChat();
  const [privateMessages, setPrivateMessages] = useState([]);
  const [toUser, setToUser] = useState(null);
  const { user } = useAuth();
  const messageBoxRef = useRef<HTMLDivElement>(null);

  function onSendMessage(content: string) {
    socketRef.current?.emit("chat/privateMessage", {
      content,
      to: toUserId,
    });
  }

  useEffect(() => {
    if (!privateMessages || !privateMessages.length) return;
    function scrollToTop() {
      messageBoxRef.current?.scrollTo(0, messageBoxRef.current.scrollHeight);
    }
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

  return (
    <MessageContainer>
      <MessageHeader>
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
      </MessageHeader>
      <MessageBody>
        <MessageBox ref={messageBoxRef}>
          {privateMessages.map((message) => {
            const owner = message.fromUserId === user.id;
            const avatar = owner ? message.from.avatar : message.to.avatar;
            const username = message.from.username;
            const { content, createdAt } = message;

            return (
              <Message
                key={message.id}
                avatar={avatar}
                owner={owner}
                content={content}
                createdAt={createdAt}
                username={username}
              />
            );
          })}
        </MessageBox>
        <SendMessage onSubmit={onSendMessage} />
      </MessageBody>
    </MessageContainer>
  );
}

interface MessageBoxProps {
  children: ReactNode;
}
export const MessageBox = forwardRef<HTMLDivElement, MessageBoxProps>(
  function MessageBox({ children }, ref) {
    return (
      <div className="grow overflow-y-auto" ref={ref}>
        <div className="px-6 py-4">{children}</div>
      </div>
    );
  }
);

interface SendMessageProps {
  onSubmit: (content: string) => void;
}

export function SendMessage({ onSubmit }: SendMessageProps) {
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messageRef.current?.focus();
  });

  function handleSubmit() {
    if (!messageRef.current) return;
    onSubmit(messageRef.current.value);
    messageRef.current.value = "";
  }

  return (
    <div className="shrink-0 grow-0 basis-auto bg-white">
      <div className="p-6">
        <textarea
          ref={messageRef}
          id="about"
          name="about"
          rows={1}
          placeholder="Ctrl Enter 发送消息"
          className="unset p=2 block h-24 w-full text-sm text-slate-600 placeholder:text-sm placeholder:text-slate-300"
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
        ></textarea>
        <button
          className=" block rounded border border-slate-50 px-6 py-1 text-slate-400 shadow transition-colors hover:bg-slate-300 hover:text-white	hover:shadow-none"
          onClick={handleSubmit}
        >
          <IconSend className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function MessageContainer({ children }: PropsWithChildren) {
  return <div className="flex h-full flex-col">{children}</div>;
}

function MessageHeader({ children }: PropsWithChildren) {
  return (
    <div className="shrink-0 grow-0 basis-auto border-b bg-white">
      {children}
    </div>
  );
}

function MessageBody({ children }: PropsWithChildren) {
  return <div className="flex grow flex-col overflow-hidden">{children}</div>;
}

interface MessageProps {
  owner: boolean;
  createdAt: string;
  username: string;
  avatar: string;
  content: string;
}

function Message({
  owner,
  createdAt,
  username,
  avatar,
  content,
}: MessageProps) {
  return (
    <div className={clsx("mb-6 flex", owner ? "justify-end" : "justify-start")}>
      <div className="flex gap-x-4">
        {!owner && (
          <img
            className="h-8 w-8 flex-none rounded-full bg-gray-50"
            src={avatar}
            alt="avatar"
          />
        )}
        <div
          className={clsx(
            "flex flex-col  overflow-hidden",
            owner ? "items-end" : "items-start"
          )}
        >
          {owner ? (
            <div className="mb-2">
              <span className="pr-2 text-xs text-slate-400">
                {new Date(createdAt).toLocaleString("zh-CN")}
              </span>
              <span className="text-xs text-slate-500">{username}</span>
            </div>
          ) : (
            <div className="mb-2">
              <span className="text-xs text-slate-500">{username}</span>
              <span className="pl-2 text-xs text-slate-400">
                {new Date(createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
          )}

          <div className="prose prose-slate max-w-prose rounded bg-white px-3 py-2 text-sm  text-slate-600  shadow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>

        {owner && (
          <img
            className="h-8 w-8 flex-none rounded-full bg-gray-50"
            src={avatar}
            alt="avatar"
          />
        )}
      </div>
    </div>
  );
}

// function renderMessages() {
//   if (!privateMessages || !privateMessages.length) return null;

//   return (
//     <div className="px-6 py-4">
//       {privateMessages.map((m: any) => {
//         const owner = m.fromUserId === user.id;

//         return (
//           <div
//             key={m.id}
//             className={clsx(
//               "mb-6 flex",
//               owner ? "justify-end" : "justify-start"
//             )}
//           >
//             <div className="flex gap-x-4">
//               {!owner && (
//                 <img
//                   className="h-8 w-8 flex-none rounded-full bg-gray-50"
//                   src={m.from.avatar}
//                   alt="avatar"
//                 />
//               )}
//               <div
//                 className={clsx(
//                   "flex flex-col  overflow-hidden",
//                   owner ? "items-end" : "items-start"
//                 )}
//               >
//                 {owner ? (
//                   <div className="mb-2">
//                     <span className="pr-2 text-xs text-slate-400">
//                       {new Date(m.createdAt).toLocaleString("zh-CN")}
//                     </span>
//                     <span className="text-xs text-slate-500">
//                       {m.from.username}
//                     </span>
//                   </div>
//                 ) : (
//                   <div className="mb-2">
//                     <span className="text-xs text-slate-500">
//                       {m.from.username}
//                     </span>
//                     <span className="pl-2 text-xs text-slate-400">
//                       {new Date(m.createdAt).toLocaleString("zh-CN")}
//                     </span>
//                   </div>
//                 )}

//                 <div className="prose prose-slate max-w-prose rounded bg-white px-3 py-2 text-sm  text-slate-600  shadow">
//                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                     {m.content}
//                   </ReactMarkdown>
//                 </div>
//               </div>

//               {owner && (
//                 <img
//                   className="h-8 w-8 flex-none rounded-full bg-gray-50"
//                   src={m.from.avatar}
//                   alt="avatar"
//                 />
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

export { ChatIndex, ChatChannel, ChatPrivate };
