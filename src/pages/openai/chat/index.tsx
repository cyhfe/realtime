import { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Conversation } from "../../../types";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../components/Dialog";
import Input from "../../../components/Input";
function Chat() {
  const [conversation, setConversation] = useState<Conversation[] | null>(null);

  async function getConvarsation() {
    const token = getToken() ?? undefined;
    const res = await requestApi({
      method: "get",
      endPoint: "conversation",
      token,
    });
    if (res.statusText === "OK") {
      const { conversation } = res.data;
      setConversation(conversation);
    }
  }

  useEffect(() => {
    getConvarsation();
  }, []);

  return (
    <div className="flex">
      <div>
        <CreateConversation onSuccess={() => getConvarsation()} />
        <div>对话列表</div>
        <div className="flex flex-col">
          {conversation &&
            conversation.map((item) => {
              return (
                <Link key={item.id} to={`/openai/chat/${item.id}`}>
                  <div> {item.name}</div>
                </Link>
              );
            })}
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

interface CreateConversationProps {
  onSuccess: () => void;
}

function CreateConversation({ onSuccess }: CreateConversationProps) {
  const [createDialogIsOpen, setCreateDialogIsOpen] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function onCreateConversation() {
    const value = createInputRef.current?.value;
    if (!value) return;
    const token = getToken() ?? undefined;
    setLoading(true);
    const res = await requestApi({
      method: "post",
      endPoint: "conversation",
      token,
      data: {
        name: value,
      },
    });
    setLoading(false);
    if (res.statusText === "OK") {
      onSuccess();
      setCreateDialogIsOpen(false);
    }
  }
  return (
    <Dialog open={createDialogIsOpen} onChange={setCreateDialogIsOpen}>
      <DialogTrigger>
        <button onClick={() => setCreateDialogIsOpen(true)}>创建对话</button>
      </DialogTrigger>
      <DialogContent title="创建对话">
        <Input name="name" label="标题" type="text" ref={createInputRef} />
        <button
          onClick={onCreateConversation}
          className="block w-full rounded  bg-sky-500 py-2 text-sm font-semibold text-white shadow hover:bg-sky-600"
          disabled={loading}
        >
          提交
        </button>
      </DialogContent>
    </Dialog>
  );
}

export default Chat;
