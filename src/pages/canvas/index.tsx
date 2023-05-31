import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AUTH_BASE_URL } from "../../utils/const";
import { useAuth } from "../../context/Auth";
import { useThrottle } from "../../hooks/useThrottle";
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

function Canvas() {
  const user = useAuth();
  const socketRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [current, setCurrent] = useState<Current | null>(null);

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

  function draw(line: Line) {
    const { px, py, nx, ny } = line;
    const el = canvasRef.current;
    const ctx = el.getContext("2d");
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(px * width, py * height);
    ctx.lineTo(nx * width, ny * height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();
    setCurrent({ x: nx, y: ny });
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

    socket.on("drawing", draw);
    socket.connect();

    return () => {
      socket.off("drawing", draw);
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="full-height  border" ref={containerRef}>
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
