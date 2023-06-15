import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
import { SiOpenai } from "react-icons/si";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Conversation() {
  const [messages, setMessages] = useState<Messages[] | null>(null);
  const messageBoxRef = useRef<HTMLDivElement | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const offset = useRef(0);
  const [count, setCount] = useState(0);
  const errorToastRef = useRef<ToastHandler>(null);
  const mountedRef = useRef(false);
  const { user } = useAuth();
  const { conversationId } = useParams();

  const hasMore = count > (messages?.length ?? 0);

  const getMessages = useCallback(
    async function getMessages() {
      const token = getToken() ?? undefined;
      try {
        setMessageLoading(true);
        const res = await requestApi({
          method: "get",
          endPoint: "message",
          token,
          params: {
            conversationId,
            offset: offset.current,
          },
        });
        if (res.statusText === "OK") {
          await sleep(5000);
          console.log(res.data);
          const { messages } = res.data;

          setMessages((prev) => {
            console.log(prev);
            if (prev === null) return messages;
            else return [...messages, ...prev];
          });
          setCount(res.data.count);
          offset.current += 1;
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
      setMessageLoading(false);
    },
    [conversationId]
  );

  async function handleSend(content: string) {
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

  function scrollToBottom() {
    const messageBox = messageBoxRef.current!;
    console.log(
      messageBox,
      messageBox.scrollHeight,
      messageBox.clientHeight,
      messageBox.scrollHeight - messageBox.clientHeight
    );
    messageBox.scrollTo(0, messageBox.scrollHeight - messageBox.clientHeight);
  }

  useEffect(() => {
    if (!messages) return;
    if (!mountedRef.current) {
      scrollToBottom();
      mountedRef.current = true;
    }
  }, [messages]);

  const handleScroll = useCallback(
    function handleScroll() {
      const messageBox = messageBoxRef.current!;
      if (messageBox.scrollTop === 0 && hasMore && !messageLoading) {
        getMessages();
      }
    },
    [hasMore, getMessages, messageLoading]
  );

  // lazy loading
  useEffect(() => {
    const messageBox = messageBoxRef.current!;

    messageBox.addEventListener("scroll", handleScroll);
    return () => {
      messageBox.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    async function init() {
      await getMessages();
      scrollToBottom();
    }
    init();
  }, [getMessages]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="grow overflow-hidden">
        <div className="h-full overflow-y-auto px-7 py-2" ref={messageBoxRef}>
          {messageLoading && <Loading />}

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
              function getAvatar() {
                const map = {
                  assistant: <SiOpenai />,
                  user: <img src={user!.avatar} alt="avatar" />,
                  system: null,
                };
                return map[role];
              }
              const avatar = getAvatar();
              return (
                <Message
                  key={id}
                  isOwnner={isOwnner}
                  createdAt={createdAt}
                  username={username}
                  content={content}
                  avatar={avatar}
                />
              );
            })}
        </div>
      </div>

      <div>
        <SendMessage disabled={messageLoading} onSubmit={handleSend} />
      </div>
      <Toast ref={errorToastRef} />
    </div>
  );
}

interface MessageProps {
  isOwnner: boolean;
  createdAt: string;
  username: string;
  avatar: ReactNode;
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
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-50 shadow-md">
            {avatar}
          </div>
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

          <div className="prose prose-slate max-w-prose rounded bg-white px-5 py-4 text-sm text-slate-600 shadow-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>

        {isOwnner && (
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-50 shadow-md">
            {avatar}
          </div>
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
    if (!messageRef.current || !messageRef.current.value) return;

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
