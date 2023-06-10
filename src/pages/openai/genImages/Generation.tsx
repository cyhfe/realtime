import { useEffect, useRef, useState } from "react";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
import { IconSend } from "../../../components/icon";

function Images() {
  const [image, setImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex">
      <div className="flex basis-1/2 items-center justify-center">
        <div className="flex flex-col">
          <input type="text" ref={inputRef} className="block" />
          <button
            className="block"
            onClick={async () => {
              const token = getToken() ?? undefined;
              const input = inputRef.current;
              if (input) {
                const res = await requestApi({
                  method: "post",
                  endPoint: "images/generations",
                  token,
                  data: {
                    prompt: input.value,
                  },
                });
                console.log(res);
                const prefix = "data:image/png;base64,";
                const src = prefix + res.data.b64_json;
                setImage(src);
              }
            }}
          >
            <IconSend />
          </button>
        </div>
      </div>
      <div className="basis-1/2">
        {image && <img src={image} alt="" width={512} height={512} />}
        {!image && (
          <div className="flex h-[512px] w-[512px] items-center justify-center rounded bg-white text-sm text-slate-400 shadow">
            根据提示词生成图片
          </div>
        )}
      </div>
    </div>
  );
}

export default Images;
