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

function ChatChanel() {
  const { chanelId } = useParams();
  const [chanelMessages, setChanelMessages] = useState(null);
  const [chanel, setChanel] = useState(null);
  const [users, setUsers] = useState(null);
  const { socketRef, isConnected } = useChat();
  const messageRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;

    function onGetChanel(chanel: any) {
      setChanel(chanel);
    }
    function onUpdateChanelMessages(message: any) {
      setChanelMessages(message);
    }
    function onUpdateChanelUsers(users: any) {
      setUsers(users);
    }

    socket.on("chat/getChanel", onGetChanel);
    socket.on("chat/updateChanelMessages", onUpdateChanelMessages);
    socket.on("chat/updateChanelUsers", onUpdateChanelUsers);

    return () => {
      socket.off("chat/getChanel", onGetChanel);
      socket.off("chat/updateChanelMessages", onUpdateChanelMessages);
      socket.off("chat/updateChanelUsers", onUpdateChanelUsers);
    };
  }, [socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return noop;
    socket.emit("chat/getChanel", chanelId);
    socket.emit("chat/enterChanel", chanelId);

    return () => {
      socket.emit("chat/leaveChanel", chanelId);
    };
  }, [chanelId, socketRef]);

  if (!isConnected) {
    return <Navigate to="/chat"></Navigate>;
  }

  return (
    <div>
      <div>频道名{chanel && chanel.name}</div>
      <div>
        当前频道用户
        {users &&
          users.map((user: any) => {
            return <div>{user.username}</div>;
          })}
      </div>
      <div>聊天内容</div>
      <div>
        {chanelMessages &&
          chanelMessages.map((m: any) => {
            return <div>{m.content}</div>;
          })}
      </div>
      <div>
        <input type="text" ref={messageRef} />
        <button
          onClick={() => {
            socketRef.current.emit("chat/chanelMessage", {
              chanelId,
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

export { ChatIndex, ChatChanel, ChatPrivate };
