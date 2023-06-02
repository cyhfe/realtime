import { clsx } from "clsx";
interface OnlineProps {
  online?: boolean;
}
export function Online({ online = false }: OnlineProps) {
  return (
    <div className="mt-1 flex  items-center gap-x-1.5">
      <div
        className={clsx(
          "flex-none  rounded-full p-1",
          online ? "bg-emerald-500/20" : "bg-rose-300/20"
        )}
      >
        <div
          className={clsx(
            "h-1.5 w-1.5 rounded-full ",
            online ? "bg-emerald-500 " : "bg-rose-300"
          )}
        ></div>
      </div>
      <p
        className={clsx(
          "text-xs leading-5 text-gray-500",
          online ? "text-gray-500" : "text-gray-400"
        )}
      >
        {online ? "在线" : "离线"}
      </p>
    </div>
  );
}
