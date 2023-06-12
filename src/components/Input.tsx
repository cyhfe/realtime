import { forwardRef } from "react";

interface InputProps {
  type: string;
  name: string;
  label: string;
}
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type, name, label },
  ref
) {
  return (
    <div>
      <label htmlFor={name} className="flex items-center gap-x-2">
        <div className="text-sm">{label}</div>
        <input
          type={type}
          ref={ref}
          name={name}
          className=" block grow rounded border p-1"
        />
      </label>
    </div>
  );
});

export default Input;
