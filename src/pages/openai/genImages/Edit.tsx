import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
import clsx from "clsx";
import Loading from "../../../components/Loading";

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
  const [mask, setMask] = useState<string | null>(null);
  const [generate, setGenerate] = useState<string | null>(null);
  const previewFileRef = useRef<HTMLInputElement | null>(null);
  const maskFileRef = useRef<HTMLInputElement | null>(null);
  const canvasHandlerRef = useRef<CanvasHandler>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onload: (res: string) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return setPreview(null);
    if (!file.type.startsWith("image/")) return setPreview(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onload(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="mb-6 flex items-stretch gap-x-6">
        <div className="">
          <label
            htmlFor="formFile"
            className="mb-2 inline-block cursor-pointer text-xs text-slate-400"
          >
            上传图片
          </label>
          <input
            id="file"
            name="file"
            type="file"
            ref={previewFileRef}
            className={clsx(
              `block cursor-pointer border bg-slate-200 text-xs text-slate-500 shadow-inner transition file:mr-4 
                file:cursor-pointer file:rounded-l file:border-0 file:bg-slate-600 file:px-4 file:py-2 file:text-xs file:font-semibold
                file:text-white file:shadow-inner file:transition`
            )}
            onChange={(e) => handleFileChange(e, (res) => setPreview(res))}
          />
        </div>
        <div className="">
          <label
            htmlFor="formFile"
            className="mb-2 inline-block cursor-pointer text-xs text-slate-400"
          >
            上传遮罩
          </label>
          <input
            id="file"
            name="file"
            type="file"
            ref={maskFileRef}
            className={clsx(
              `block cursor-pointer border bg-slate-200 text-xs text-slate-500 shadow-inner transition file:mr-4 
                file:cursor-pointer file:rounded-l file:border-0 file:bg-slate-600 file:px-4 file:py-2 file:text-xs file:font-semibold
                file:text-white file:shadow-inner file:transition`
            )}
            onChange={(e) => handleFileChange(e, (res) => setMask(res))}
          />
        </div>
        <div className="flex h-[33px] grow self-end">
          <input
            type="text"
            placeholder="提示词"
            // className="block w-full rounded-full border border-slate-500 bg-gray-50 p-3 text-gray-900 focus:border-slate-500 focus:ring-slate-500 sm:text-xs"
            className="block  w-full rounded-full px-4  text-xs shadow"
          />
        </div>
        <div className="flex h-[33px] cursor-pointer items-center justify-center self-end rounded bg-white px-6 text-sm font-semibold text-slate-500 shadow transition hover:bg-slate-600 hover:text-white">
          <div>合成</div>
        </div>
      </div>

      <div className="mb-6 flex">
        <div className="flex basis-1/2 items-center justify-center">
          <div className="flex h-[512px] w-[512px] items-center justify-center rounded bg-white text-sm text-slate-400 shadow">
            {preview ? (
              <img
                src={preview}
                alt=""
                width={512}
                height={512}
                className="rounded bg-white text-sm text-slate-400 shadow"
              />
            ) : (
              <div className="flex flex-col items-center gap-y-2">
                <p>要应用合成的图片</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex basis-1/2 items-center justify-center">
          <div className="flex h-[512px] w-[512px] items-center justify-center rounded bg-white text-sm text-slate-400 shadow">
            {mask ? (
              <img
                src={mask}
                alt=""
                width={512}
                height={512}
                className="rounded bg-white text-sm text-slate-400 shadow"
              />
            ) : (
              <div className="flex flex-col items-center gap-y-2">
                <p>遮罩图片,上传后使用鼠标在此区域涂抹编辑</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex h-[512px] w-[512px] items-center justify-center rounded bg-white text-sm text-slate-400 shadow">
          {isLoading ? (
            <Loading />
          ) : generate ? (
            <img
              src={generate}
              alt=""
              width={512}
              height={512}
              className="rounded bg-white text-sm text-slate-400 shadow"
            />
          ) : (
            <div className="flex flex-col items-center gap-y-2">
              <p>生成的变体图片</p>
            </div>
          )}
        </div>
      </div>

      {/* <div className="flex w-full items-center justify-center">
        <label htmlFor="file">File</label>
        <input
          ref={fileRef}
          id="file"
          name="file"
          type="file"
          onChange={handleFileChange}
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
      </div> */}
    </div>
  );
};

export default Edit;
