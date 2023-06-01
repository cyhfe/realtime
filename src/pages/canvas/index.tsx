import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { AUTH_BASE_URL, COLOR } from "../../utils/const";
import { useAuth } from "../../context/Auth";
import { useThrottle } from "../../hooks/useThrottle";
import { PenIcon, TrashIcon } from "./icon";
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
  const socketRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [current, setCurrent] = useState<Current | null>(null);
  const [strokeColor, setStrokeColor] = useState(COLOR.Slate);
  // reflow
  useLayoutEffect(() => {
    function onResize() {
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
      const { px, py, nx, ny } = line;
      const el = canvasRef.current;
      const ctx = el.getContext("2d");
      const { width, height } = canvasRef.current.getBoundingClientRect();
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
    const ctx = el.getContext("2d");
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    setIsDrawing(true);
    const { top, left, width, height } =
      canvasRef.current.getBoundingClientRect();
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
    if (!isDrawing) return;

    const { top, left, width, height } =
      canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const line = {
      px: current.x,
      py: current.y,
      nx: x,
      ny: y,
    };

    socketRef.current.emit("drawing", line);

    draw(line);
  },
  10);

  useEffect(() => {
    socketRef.current = io(AUTH_BASE_URL + "canvas", {
      autoConnect: false,
      auth: {
        user: JSON.stringify(user),
      },
    });
    const socket = socketRef.current;
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
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("drawing", draw);
      socket.off("clear", clear);
      socket.off("changeStrokeColor", setStrokeColor);

      socket.disconnect();
      setOnline(false);
    };
  }, [draw, setOnline, user]);

  return (
    <div className="full-height  relative border" ref={containerRef}>
      <div className="absolute  right-1/2 top-5 flex translate-x-1/2 items-center gap-x-1 divide-x  bg-slate-50 p-2 text-slate-400 shadow-xl">
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
                  socketRef.current.emit("changeStrokeColor", color);
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
              socketRef.current.emit("clear");
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
