import axios from "axios";
import { useRef, useState } from "react";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";

type Props = {};

const Variation = (props: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<string | null>(null);

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

        {image && <img src={image} alt="" />}

        <button
          onClick={() => {
            console.log(fileRef.current?.files?.[0]);
            const file = fileRef.current?.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            const token = getToken() ?? undefined;
            console.log(token);
            requestApi({
              method: "post",
              endPoint: "/images/variations/upload",
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
          变化
        </button>
      </div>
    </div>
  );
};

export default Variation;
