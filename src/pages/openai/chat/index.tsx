import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { Conversation } from "../../../types";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../../components/Dialog";
import Input from "../../../components/Input";
import clsx from "clsx";
import Loading from "../../../components/Loading";
import { IconClose } from "../../../components/icon";
function Chat() {
  const [conversation, setConversation] = useState<Conversation[] | null>(null);
  const { conversationId } = useParams();
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
    <div className="flex h-full">
      <div className="basis-[180px] overflow-y-auto overflow-x-hidden border-r  py-1 md:block">
        <CreateConversation onSuccess={() => getConvarsation()} />
        <div className="flex flex-col divide-y divide-slate-100 border-y">
          {conversation &&
            conversation.map((item) => {
              const isActive = conversationId === item.id;
              return (
                <div
                  key={item.id}
                  className={!isActive ? "bg-white" : "bg-slate-200"}
                >
                  <div
                    className={clsx("flex", !isActive && "hover:bg-slate-50")}
                  >
                    <Link
                      to={`/openai/chat/${item.id}`}
                      className={clsx(
                        "flex grow items-center px-4 py-2 text-sm text-slate-600"
                      )}
                    >
                      {item.name}
                    </Link>
                    <DeleteConversation
                      onSuccess={() => getConvarsation()}
                      conversationId={item.id}
                      name={item.name}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="grow overflow-hidden ">
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
        <div className="flex items-center justify-center px-4">
          <button
            onClick={() => setCreateDialogIsOpen(true)}
            className="my-3 block w-full rounded-full border bg-white py-2 text-xs  text-slate-600  shadow-sm transition hover:bg-slate-500 hover:text-white"
          >
            创建对话
          </button>
        </div>
      </DialogTrigger>
      <DialogContent title="创建对话">
        <Input name="name" label="标题" type="text" ref={createInputRef} />
        <button
          onClick={onCreateConversation}
          className="block w-full rounded  bg-slate-600 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700"
          disabled={loading}
        >
          提交
        </button>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConversationProps {
  onSuccess: () => void;
  conversationId: string;
  name: string;
}

function DeleteConversation({
  onSuccess,
  conversationId,
  name,
}: DeleteConversationProps) {
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  async function onDeleteConversation() {
    const token = getToken() ?? undefined;
    setLoading(true);
    const res = await requestApi({
      method: "delete",
      endPoint: `conversation/${conversationId}`,
      token,
    });
    setLoading(false);
    if (res.statusText === "OK") {
      onSuccess();
      setDeleteDialogIsOpen(false);
    }
  }
  return (
    <Dialog open={deleteDialogIsOpen} onChange={setDeleteDialogIsOpen}>
      <DialogTrigger>
        <div className="flex cursor-pointer items-center px-3 text-slate-200 transition-colors hover:bg-rose-400 hover:text-white">
          <IconClose className="h-4 w-4" />
        </div>
      </DialogTrigger>
      <DialogContent title="删除对话">
        <div className="text-semibold text-sm text-slate-600">
          确认删除对话: {name}
        </div>
        <div className="flex gap-x-2">
          <button
            onClick={onDeleteConversation}
            className="block w-full rounded  bg-slate-600 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700 focus:ring-0"
            disabled={loading}
          >
            {loading ? <Loading className="h-3 w-3" /> : "确认"}
          </button>
          <button
            onClick={() => setDeleteDialogIsOpen(false)}
            className="block w-full rounded   py-2 text-sm font-semibold text-slate-600 shadow hover:bg-slate-400 hover:text-white"
            disabled={loading}
          >
            取消
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Chat;
