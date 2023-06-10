import { useRef, useState } from "react";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
import { IconSend } from "../../../components/icon";
import Loading from "../../../components/Loading";
import { Toast, ToastHandler } from "../../../components/Toast";
function Images() {
  const [image, setImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const errorToastRef = useRef<ToastHandler>(null);

  return (
    <div className="flex">
      <div className="flex basis-1/2 items-center justify-center">
        <div className="flex w-3/4 flex-col p-6">
          <div className="mb-3 pl-2 text-sm text-slate-400">提示词</div>
          <div className="relative">
            <input
              type="text"
              ref={inputRef}
              className="block  w-full rounded-full border  px-4 py-3 pr-[60px] shadow"
            />
            <div className="absolute right-3 top-0 flex h-full items-center">
              <button
                disabled={isLoading}
                className="block border-l border-slate-200 px-1 text-slate-400 hover:text-slate-700 md:px-[16px]"
                onClick={async () => {
                  const token = getToken() ?? undefined;
                  const input = inputRef.current;
                  if (input) {
                    setIsLoading(true);
                    try {
                      const res = await requestApi({
                        method: "post",
                        endPoint: "images/generations",
                        token,
                        data: {
                          prompt: input.value,
                        },
                      });
                      const prefix = "data:image/png;base64,";
                      const src = prefix + res.data.b64_json;
                      setImage(src);
                    } catch (error) {
                      errorToastRef.current?.toast({
                        title: "服务端错误",
                        content: "提示词生成图片失败",
                      });
                    }
                    setIsLoading(false);
                  }
                }}
              >
                <IconSend />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="basis-1/2">
        {image && !isLoading && (
          <img
            src={image}
            alt=""
            width={512}
            height={512}
            className="rounded bg-white text-sm text-slate-400 shadow"
          />
        )}
        {(isLoading || !image) && (
          <div className="flex h-[512px] w-[512px] items-center justify-center rounded bg-white text-sm text-slate-400 shadow">
            {!isLoading && "根据提示词生成图片"}
            {isLoading && <Loading />}
          </div>
        )}
      </div>
      <Toast ref={errorToastRef} />
    </div>
  );
}

export default Images;
