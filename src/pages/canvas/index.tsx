import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { AUTH_BASE_URL, COLOR } from "../../utils/const";
import { useAuth } from "../../context/Auth";
import { useThrottle } from "../../hooks/useThrottle";
import { PenIcon, TrashIcon } from "./icon";
import { User } from "../../types";
interface Current {
  x: number;
  y: number;
}

interface Line {
  px: number;
  py: number;
  nx: number;
  ny: number;
}

const colors = [COLOR.Green, COLOR.Red, COLOR.Slate, COLOR.Violet];

function Canvas() {
  const { user, setOnline } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [current, setCurrent] = useState<Current | null>(null);
  const [strokeColor, setStrokeColor] = useState(COLOR.Slate);
  const [users, setUsers] = useState<User[] | null>(null);
  // reflow
  useLayoutEffect(() => {
    function onResize() {
      if (!containerRef.current || !canvasRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const draw = useCallback(
    function draw(line: Line) {
      const el = canvasRef.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) return;
      const { px, py, nx, ny } = line;
      const ctx = el.getContext("2d");
      if (!ctx) return;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(px * width, py * height);
      ctx.lineTo(nx * width, ny * height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
      ctx.closePath();
      setCurrent({ x: nx, y: ny });
    },
    [strokeColor]
  );

  function clear() {
    const el = canvasRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const { top, left, width, height } = canvas.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    setCurrent({ x, y });
  }
  function onMouseUp() {
    setIsDrawing(false);
  }
  function onMouseOut() {
    setIsDrawing(false);
  }

  const onMouseMove = useThrottle(function onMouseMove(
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) {
    if (!isDrawing || !current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { top, left, width, height } = canvas.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const line = {
      px: current.x,
      py: current.y,
      nx: x,
      ny: y,
    };

    socketRef.current?.emit("drawing", line);

    draw(line);
  },
  10);

  useEffect(() => {
    socketRef.current = io(AUTH_BASE_URL + "canvas", {
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
    if (!socket) return;
    function onConnect() {
      setOnline(true);
    }

    function onDisconnect() {
      setOnline(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("drawing", draw);
    socket.on("clear", clear);
    socket.on("changeStrokeColor", setStrokeColor);
    socket.on("updateUsers", (users: User[]) => {
      setUsers(users);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("drawing", draw);
      socket.off("clear", clear);
      socket.off("changeStrokeColor", setStrokeColor);
      setOnline(false);
    };
  }, [draw, setOnline, user]);

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      <div className="absolute left-4 top-4 flex flex-col -space-y-2 overflow-hidden">
        {users &&
          users.map((user) => {
            return (
              <img
                key={user.id}
                className="inline-block h-11 w-11 rounded-full ring-2 ring-white"
                src={user.avatar}
                alt="avatar"
              />
            );
          })}
      </div>

      <div className="absolute  right-1/2 top-5 flex translate-x-1/2 items-center gap-x-1 divide-x  border border-slate-50 bg-slate-50 p-2 text-slate-400 shadow-md">
        <div className="flex items-center pr-1">
          <button className=" block  p-1">
            <PenIcon />
          </button>
        </div>
        <div className=" flex items-center gap-x-1 px-1">
          {colors.map((color) => {
            return (
              <button
                className="box-border rounded-md p-2"
                key={color}
                style={{
                  background: strokeColor === color ? "#cbd5e1" : "",
                }}
                onClick={() => {
                  setStrokeColor(color);
                  socketRef.current?.emit("changeStrokeColor", color);
                }}
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    background: color,
                  }}
                ></div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center pl-1">
          <button
            onClick={() => {
              clear();
              socketRef.current?.emit("clear");
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <canvas
        className="bg-white"
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseOut={onMouseOut}
        onMouseMove={onMouseMove}
      ></canvas>
    </div>
  );
}

export default Canvas;
