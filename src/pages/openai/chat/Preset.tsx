import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../components/Dialog";
type Props = {};

const Preset = (props: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onChange={setOpen}>
      <DialogTrigger>1123</DialogTrigger>
      <DialogContent>1</DialogContent>
    </Dialog>
  );
};

export default Preset;
