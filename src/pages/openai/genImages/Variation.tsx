import { useRef, useState } from "react";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
import clsx from "clsx";
import Loading from "../../../components/Loading";
import { Toast, ToastHandler } from "../../../components/Toast";

const Variation = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const errorToastRef = useRef<ToastHandler>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log(file);
    if (!file) return setPreview(null);
    if (!file.type.startsWith("image/")) return setPreview(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }

  function handleGenerate() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken() ?? undefined;
    setIsLoading(true);
    requestApi({
      method: "post",
      endPoint: "/images/variations/upload",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
      token,
    })
      .then((res) => {
        const prefix = "data:image/png;base64,";
        const src = prefix + res.data.b64_json;
        setImage(src);
      })
      .catch((err) => {
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
    <div>
      <label
        htmlFor="formFile"
        className="mb-2 inline-block cursor-pointer text-xs text-slate-400"
      >
        上传图片
      </label>
      <div className="mb-6 flex gap-x-6">
        <input
          id="file"
          name="file"
          type="file"
          ref={fileRef}
          className={clsx(
            `block cursor-pointer border bg-slate-200 text-xs text-slate-500 shadow-inner transition file:mr-4 
                file:cursor-pointer file:rounded-l file:border-0 file:bg-slate-600 file:px-4 file:py-2 file:text-xs file:font-semibold
                file:text-white file:shadow-inner file:transition`
          )}
          onChange={handleFileChange}
        />
        <button
          className="cursor-pointer rounded bg-white px-6 text-sm font-semibold text-slate-500 shadow transition hover:bg-slate-600 hover:text-white"
          onClick={handleGenerate}
        >
          变化
        </button>
      </div>

      <div className="flex">
        <div className="flex basis-1/2 justify-center">
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
                <p>上传图片生成变体</p>
                <p>尺寸512x512</p>
                <p>小于4MB</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex basis-1/2 justify-center">
          <div className="flex h-[512px] w-[512px] items-center justify-center rounded bg-white text-sm text-slate-400 shadow">
            {isLoading ? (
              <Loading />
            ) : image ? (
              <img
                src={image}
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
      </div>
      <Toast ref={errorToastRef} />
    </div>
  );
};

export default Variation;
