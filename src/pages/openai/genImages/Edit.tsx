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
import { Toast, ToastHandler } from "../../../components/Toast";

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
  const [isDrawing, setIsDrawing] = useState(false);

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

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    setIsDrawing(true);
  }
  function onMouseUp() {
    setIsDrawing(false);
  }
  function onMouseOut() {
    setIsDrawing(false);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!isDrawing || !imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { top, left } = canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const imageData = ctx.createImageData(10, 10);
    ctx.putImageData(imageData, x, y);
  }

  useEffect(() => {
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

  return (
    <canvas
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOut={onMouseOut}
      onMouseMove={onMouseMove}
      width={512}
      height={512}
      className="border bg-transparent"
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
  const errorToastRef = useRef<ToastHandler>(null);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onload: (res: string | null) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return onload(null);
    if (file.type !== "image/png") {
      onload(null);
      e.target.value = "";
      return errorToastRef.current?.toast({
        title: "错误",
        content: "请上传png格式的图片",
      });
    }
    const maximumSize = 4 * 1024 * 1024;

    if (file.size >= maximumSize) {
      onload(null);
      e.target.value = "";
      return errorToastRef.current?.toast({
        title: "错误",
        content: "图片大小不能超过4MB",
      });
    }

    const reader = new FileReader();
    reader.onload = (progressEvent) => {
      const result = progressEvent.target?.result as string;
      const img = new Image();
      img.src = result;

      img.onload = function () {
        if (img.width !== 512 || img.height !== 512) {
          onload(null);
          e.target.value = "";
          return errorToastRef.current?.toast({
            title: "错误",
            content: "图片尺寸必须为512x512",
          });
        }
        onload(result);
      };
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    const file = previewFileRef.current?.files?.[0];
    if (!file)
      return errorToastRef.current?.toast({
        title: "错误",
        content: "请上传图片",
      });

    const prompt = inputRef.current?.value ?? "";
    if (!prompt)
      return errorToastRef.current?.toast({
        title: "错误",
        content: "请输入提示词",
      });

    const mask = await canvasHandlerRef.current?.toFile();
    if (!mask)
      return errorToastRef.current?.toast({
        title: "错误",
        content: "请上传遮罩",
      });

    const formData = new FormData();
    formData.append("file", file);
    mask && formData.append("mask", mask);
    formData.append("prompt", prompt);

    const token = getToken() ?? undefined;
    setIsLoading(true);
    requestApi({
      method: "post",
      endPoint: "/images/edit/upload",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
      token,
    })
      .then((res) => {

        const prefix = "data:image/png;base64,";
        const src = prefix + res.data.b64_json;
        setGenerate(src);
      })
      .catch((err) => {
        console.log(err);
        errorToastRef.current?.toast({
          title: "服务端错误",
          content: "生成图片失败",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="">
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
            className="block  w-full rounded-full px-4  text-xs shadow"
            ref={inputRef}
          />
        </div>
        <div className="flex h-[33px] cursor-pointer items-center justify-center self-end rounded bg-white px-6 text-sm font-semibold text-slate-500 shadow transition hover:bg-slate-600 hover:text-white">
          <button onClick={handleGenerate} disabled={isLoading}>
            合成
          </button>
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
              <ImageEdit src={mask} ref={canvasHandlerRef} />
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
              className="rounded bg-white text-sm text-slate-400 shadow "
            />
          ) : (
            <div className="flex flex-col items-center gap-y-2">
              <p>生成的合成图片</p>
            </div>
          )}
        </div>
      </div>
      <Toast ref={errorToastRef} />
    </div>
  );
};

export default Edit;
