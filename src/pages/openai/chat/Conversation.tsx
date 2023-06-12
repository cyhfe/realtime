import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { requestApi } from "../../../utils/request";
import { getToken } from "../../../utils";
import { Messages } from "../../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { useAuth } from "../../../context/Auth";
import { IconSend } from "../../../components/icon";
import Loading from "../../../components/Loading";
import { Toast, ToastHandler } from "../../../components/Toast";

function Conversation() {
  const [messages, setMessages] = useState<Messages[] | null>(null);
  const messageBoxRef = useRef<HTMLDivElement | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const errorToastRef = useRef<ToastHandler>(null);
  const { user } = useAuth();
  const { conversationId } = useParams();
  const getMessages = useCallback(
    async function getMessages() {
      const token = getToken() ?? undefined;
      try {
        const res = await requestApi({
          method: "get",
          endPoint: "message",
          token,
          params: {
            conversationId,
          },
        });
        if (res.statusText === "OK") {
          console.log(res.data);
          const { messages } = res.data;
          setMessages(messages);
        } else {
          console.log(res.data);
          errorToastRef.current?.toast({
            title: "服务端错误",
            content: "error",
          });
        }
      } catch (error: any) {
        console.log(123);
        errorToastRef.current?.toast({
          title: "服务端错误",
          content: "error",
        });
      }
    },
    [conversationId]
  );

  async function handleSend(content: string )  {
    const token = getToken() ?? undefined;
    setMessageLoading(true);
    try {
      const res = await requestApi({
        method: "post",
        endPoint: "message",
        token,
        data: {
          content,
          conversationId,
        },
      });
      if (res.statusText === "OK") {
        const messages = res.data.messages;
        setMessages(messages);
      } else {
        errorToastRef.current?.toast({
          title: "服务端错误",
          content: "error",
        });
      }
    } catch (error: any) {
      errorToastRef.current?.toast({
        title: "服务端错误",
        content: "error",
      });
    }
    setMessageLoading(false);
  }

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  useEffect(() => {
    if (!messages || !messages.length) return;
    function scrollToTop() {
      messageBoxRef.current?.scrollTo(0, messageBoxRef.current.scrollHeight);
    }
    scrollToTop();
  }, [messages, messageLoading]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="grow overflow-hidden">
        <div className="h-full overflow-y-auto px-7 py-2" ref={messageBoxRef}>
          {messages &&
            user &&
            messages.map(({ role, createdAt, content, id }) => {
              const isOwnner = role === "user";
              function getUsername() {
                const map = {
                  assistant: "ChatGPT",
                  user: user!.username,
                  system: "系统",
                };
                return map[role];
              }
              const username = getUsername();
              return (
                <Message
                  key={id}
                  isOwnner={isOwnner}
                  createdAt={createdAt}
                  username={username}
                  content={content}
                  avatar={user.avatar}
                />
              );
            })}
          {messageLoading && <Loading />}
        </div>
      </div>

      <div>
        <SendMessage
          disabled={messageLoading}
          onSubmit={handleSend}
        />
      </div>
      <Toast ref={errorToastRef} />
    </div>
  );
}

interface MessageProps {
  isOwnner: boolean;
  createdAt: string;
  username: string;
  avatar: string;
  content: string;
}

function Message({
  isOwnner,
  createdAt,
  username,
  avatar,
  content,
}: MessageProps) {
  return (
    <div
      className={clsx("mb-6 flex", isOwnner ? "justify-end" : "justify-start")}
    >
      <div className="flex gap-x-4">
        {!isOwnner && (
          <img
            className="h-8 w-8 flex-none rounded-full bg-gray-50"
            src={avatar}
            alt="avatar"
          />
        )}
        <div
          className={clsx(
            "flex flex-col  overflow-hidden",
            isOwnner ? "items-end" : "items-start"
          )}
        >
          {isOwnner ? (
            <div className="mb-2">
              <span className="pr-2 text-xs text-slate-400">
                {new Date(createdAt).toLocaleString("zh-CN")}
              </span>
              <span className="text-xs text-slate-500">{username}</span>
            </div>
          ) : (
            <div className="mb-2">
              <span className="text-xs text-slate-500">{username}</span>
              <span className="pl-2 text-xs text-slate-400">
                {new Date(createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
          )}

          <div className="prose prose-slate max-w-prose rounded bg-white px-3 py-2 text-sm  text-slate-600  shadow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>

        {isOwnner && (
          <img
            className="h-8 w-8 flex-none rounded-full bg-gray-50"
            src={avatar}
            alt="avatar"
          />
        )}
      </div>
    </div>
  );
}

interface SendMessageProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export function SendMessage({ onSubmit, disabled = false }: SendMessageProps) {
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messageRef.current?.focus();
  });

  function handleSubmit() {
    if (!messageRef.current || !messageRef.current.value ) return;

    onSubmit(messageRef.current.value);
    messageRef.current.value = "";
  }

  return (
    <div className="shrink-0 grow-0 basis-auto bg-white">
      <div className="p-6">
        <textarea
          disabled={disabled}
          ref={messageRef}
          id="about"
          name="about"
          rows={1}
          placeholder="Ctrl Enter 发送消息"
          className="unset p=2 block h-24 w-full text-sm text-slate-600 placeholder:text-sm placeholder:text-slate-300"
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
        ></textarea>
        <button
          disabled={disabled}
          className=" block rounded border border-slate-50 px-6 py-1 text-slate-400 shadow transition-colors hover:bg-slate-300 hover:text-white	hover:shadow-none"
          onClick={handleSubmit}
        >
          <IconSend className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default Conversation;
