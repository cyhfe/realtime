import { useRef, useState } from "react";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";

function Images() {
  const [image, setImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button>根据提示词生成图片</button>
      <input type="text" ref={inputRef} />
      {image && <img src={image} alt="" />}
      <button
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
        生成
      </button>
    </div>
  );
}

export default Images;
