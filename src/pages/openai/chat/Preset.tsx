import { ComponentPropsWithoutRef, ReactNode, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../components/Dialog";
import clsx from "clsx";
type Props = {};

const Preset = (props: Props) => {
  const [open, setOpen] = useState(false);
  const TextareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <Dialog open={open} onChange={setOpen}>
      <DialogTrigger>
        <button>preset</button>
      </DialogTrigger>
      <DialogContent title="系统预设">
        <div className="flex max-w-[600px] flex-wrap gap-2 text-xs">
          <BaseButton>不受约束的 AI 模型</BaseButton>
          <BaseButton>不受约束的 AI 模型</BaseButton>
          <BaseButton>不受约束的 AI 模型</BaseButton>
          <BaseButton>不受约束的 AI 模型</BaseButton>
          <BaseButton>不受约束的 AI 模型</BaseButton>
          <BaseButton>不受约束的 AI 模型</BaseButton>
          <BaseButton>不受约束的 AI 模型</BaseButton>
          <BaseButton>不受约束的 AI 模型</BaseButton>
        </div>

        <textarea
          name=""
          id=""
          className="border p-4"
          ref={TextareaRef}
        ></textarea>
        <div className="flex justify-end gap-x-2">
          <button className="rounded bg-slate-600 px-2 py-1 text-white">
            保存
          </button>
          <button className="rounded bg-rose-600 px-2 py-1 text-white">
            取消
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface BaseButtonProps extends ComponentPropsWithoutRef<"button"> {
  children: ReactNode;
}

function BaseButton({ children, className, ...rest }: BaseButtonProps) {
  return (
    <button
      className={clsx(
        "border  px-2 py-1 transition hover:bg-slate-100",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Preset;
