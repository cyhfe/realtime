import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useChat } from ".";
function noop() {}

function ChatIndex() {
  return <div>index</div>;
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
  const [privateMessages, setPrivateMessages] = useState(null);
  const messageRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;
    socket.emit("chat/updatePrivateMessages", toUserId);
  }, [socketRef, toUserId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;
    function onUpdatePrivateMessages(messages: any) {
      setPrivateMessages(messages);
    }
    socket.on("chat/updatePrivateMessages", onUpdatePrivateMessages);
    return () => {
      socket.off("chat/updatePrivateMessages", onUpdatePrivateMessages);
    };
  }, [socketRef]);

  if (!isConnected) {
    return <Navigate to="/chat"></Navigate>;
  }

  return (
    <div>
      <div>
        <div>聊天内容</div>
        {privateMessages &&
          privateMessages.map((m: any) => {
            return <div key={m.id}>{m.content}</div>;
          })}
      </div>
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
