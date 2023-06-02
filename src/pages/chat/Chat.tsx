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
        <input type="text" ref={messageRef} />
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
  const messageRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

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

    return privateMessages.map((m: any) => {
      const owner = m.fromUserId === user.id;

      return (
        <div
          key={m.id}
          className={clsx("flex", owner ? "justify-end" : "justify-start")}
        >
          <div>
            <img
              className="h-11 w-11 flex-none rounded-full bg-gray-50 "
              src={m.from.avatar}
              alt="avatar"
            />
          </div>
          <div>{m.createdAt}</div>
          {m.content}
        </div>
      );
    });
  }

  return (
    <div>
      {toUser && (
        <div className="bg-white">
          <img
            className="h-11 w-11 flex-none rounded-full bg-gray-50 "
            src={toUser.avatar}
            alt="avatar"
          />
          <div className="ml-4 flex flex-col ">
            <div>{toUser.username}</div>
          </div>
        </div>
      )}
      <div className="flex flex-col">{renderMessages()}</div>
      <input type="text" ref={messageRef} />
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
  );
}

export { ChatIndex, ChatChannel, ChatPrivate };
