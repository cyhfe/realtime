import {
  PropsWithChildren,
  createContext,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { AUTH_BASE_URL } from "../utils/const";
import { useAuth } from "./Auth";

const SocketContext = createContext(null);
export function useSocket() {
  return useContext(SocketContext);
}
export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useAuth();

  const ctx = useMemo(() => {
    return {
      socketRef,
    };
  }, []);

  useLayoutEffect(() => {
    socketRef.current = io(AUTH_BASE_URL, {
      autoConnect: false,
      auth: {
        user: JSON.stringify(user),
      },
    });
    const socket = socketRef.current;

    socket.on("connect", onConnect);
    function onConnect() {
      setIsConnected(true);
      socket.emit("chat/connect", user);
    }

    function onDisconnect() {
      setIsConnected(false);
    }
    socket.connect();

    return () => {
      socket.off("connect", onDisconnect);
      socket.disconnect();
    };
  }, [user]);

  return isConnected ? (
    <SocketContext.Provider value={ctx}>{children}</SocketContext.Provider>
  ) : (
    <div>socket 未连接</div>
  );
}
