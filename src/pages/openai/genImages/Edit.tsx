import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";

export type CanvasHandler = {
  toFile: () => Promise<File>;
};

type ImageEditProps = {
  src: string;
};

const ImageEdit = forwardRef<CanvasHandler, ImageEditProps>(function ImageEdit(
  { src },
  ref
) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        toFile() {
          const canvas = canvasRef.current;
          if (!canvas) return Promise.reject();
          return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) return reject();
              const mask = new File([blob as Blob], "mask.png", {
                type: "image/png",
              });
              resolve(mask);
            });
          });
        },
      };
    },
    []
  );

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    console.log("mouse down");
    setIsEditing(true);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!imageLoaded) return;

    console.log("mouse move");
    if (!isEditing) return;
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    var radius = 10; // 涂抹的半径
    ctx.clearRect(mouseX - radius, mouseY - radius, radius * 2, radius * 2);
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    console.log("mouse up");
    setIsEditing(false);
  }

  useEffect(() => {
    if (!canvasRef || typeof canvasRef === "function" || !canvasRef.current)
      return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
    };
  }, [canvasRef, src]);

  useEffect(() => {
    if (!imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  }, [canvasRef, imageLoaded]);
  return (
    <canvas
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      width={512}
      height={512}
      className="border bg-sky-300"
      ref={canvasRef}
    ></canvas>
  );
});

const Edit = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [edit, setEdit] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const canvasHandlerRef = useRef<CanvasHandler>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="flex w-full items-center justify-center">
        <label htmlFor="file">File</label>
        <input
          ref={fileRef}
          id="file"
          name="file"
          type="file"
          onChange={(v) => {
            const file = v.target.files?.[0];
            if (!file) return setPreview(null);
            handleFileChange(file);
          }}
        />

        <button>Upload</button>
        {preview && <img src={preview} alt="" width={512} height={512} />}

        {preview && <ImageEdit src={preview} ref={canvasHandlerRef} />}

        <input type="text" ref={inputRef} />

        <button
          onClick={async () => {
            const file = fileRef.current?.files?.[0];
            if (!file) return;

            const prompt = inputRef.current?.value ?? "";
            if (!prompt) return;

            const mask = await canvasHandlerRef.current?.toFile();

            if (!mask) return;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("mask", mask);
            formData.append("prompt", prompt);

            const token = getToken() ?? undefined;

            requestApi({
              method: "post",
              endPoint: "/images/edit/upload",
              data: formData,
              headers: { "Content-Type": "multipart/form-data" },
              token,
            })
              .then((res) => {
                console.log(res);
                console.log("upload complete xxx");
                const prefix = "data:image/png;base64,";
                const src = prefix + res.data.b64_json;
                setImage(src);
              })
              .catch((err) => {
                console.log(err);
                console.log("upload error");
              });
          }}
        >
          生成
        </button>
        {image && <img src={image} alt="" width={512} height={512} />}
      </div>
    </div>
  );
};

export default Edit;
