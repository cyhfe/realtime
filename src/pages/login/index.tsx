import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { requestAuth, setToken } from "../../utils";
import { useAuth } from "../../context/Auth";
import * as Tabs from "@radix-ui/react-tabs";
import * as Form from "@radix-ui/react-form";

function Signup() {
  const [serverError, setServerError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password");
    const username = formData.get("username");
    const body = {
      username,
      password,
    };
    const res = await requestAuth("user", {
      method: "post",
      data: body,
    });
    const data = await res.json();

    if (res.status !== 200) {
      setServerError(data.message);
    } else {
      const { username, id } = data.user;
      setUser({
        username,
        id,
      });

      setToken(data.token);
      navigate("/chat");
    }
  }

  const fields = [
    {
      name: "username",
      label: "用户名",
      message: "请输入用户名",
      type: "text",
    },
    {
      name: "password",
      label: "密码",
      message: "请输入密码",
      type: "password",
    },
  ];

  return (
    <div>
      <Form.Root className="FormRoot" onSubmit={handleSubmit}>
        {serverError && (
          <div className="mb-1.5 text-xs text-red-400">
            服务端错误: {serverError}
          </div>
        )}
        {fields.map((field, i) => {
          return (
            <Form.Field
              key={i}
              className="mb-2.5 flex flex-col"
              name={field.name}
            >
              <div className="mb-1.5 flex items-center gap-x-2 text-xs">
                <Form.Label className=" block text-slate-400">
                  {field.label}
                </Form.Label>
                <Form.Message className="text-red-400" match="valueMissing">
                  {field.message}
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="mb-2.5 block rounded border bg-white  p-1 text-sm active:border-blue-600"
                  type={field.type}
                  required
                  autoComplete={field.name}
                />
              </Form.Control>
            </Form.Field>
          );
        })}
        <Form.Submit asChild>
          <button className="w-full rounded bg-blue-600 p-2 text-sm text-white hover:bg-blue-700">
            登录
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}
function Login() {
  const [serverError, setServerError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password");
    const username = formData.get("username");
    const body = {
      username,
      password,
    };
    const res = await requestAuth("signin", {
      method: "post",
      data: body,
    });
    const data = await res.json();

    if (res.status !== 200) {
      setServerError(data.message);
    } else {
      const { username, id } = data.user;
      setUser({
        username,
        id,
      });

      setToken(data.token);
      navigate("/chat");
    }
  }

  const fields = [
    {
      name: "username",
      label: "用户名",
      message: "请输入用户名",
      type: "text",
    },
    {
      name: "password",
      label: "密码",
      message: "请输入密码",
      type: "password",
    },
  ];

  return (
    <div>
      <Form.Root className="FormRoot" onSubmit={handleSubmit}>
        {serverError && (
          <div className="mb-1.5 text-xs text-red-400">
            服务端错误: {serverError}
          </div>
        )}
        {fields.map((field, i) => {
          return (
            <Form.Field
              key={i}
              className="mb-2.5 flex flex-col"
              name={field.name}
            >
              <div className="mb-1.5 flex items-center gap-x-2 text-xs">
                <Form.Label className=" block text-slate-400">
                  {field.label}
                </Form.Label>
                <Form.Message className="text-red-400" match="valueMissing">
                  {field.message}
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="mb-2.5 block rounded border bg-white  p-1 text-sm active:border-blue-600"
                  type={field.type}
                  required
                  autoComplete={field.name}
                />
              </Form.Control>
            </Form.Field>
          );
        })}
        <Form.Submit asChild>
          <button className="w-full rounded bg-blue-600 p-2 text-sm text-white hover:bg-blue-700">
            登录
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

function LoginPage() {
  const ctx = useAuth();

  if (ctx.user) {
    return <Navigate to={"/chat"} />;
  }

  const tabs = [
    {
      label: "登录",
      content: <Login />,
    },
    {
      label: "注册",
      content: <Signup />,
    },
  ];
  return (
    <div className="flex h-screen w-full bg-slate-100">
      <div className="m-auto mt-32 flex items-center justify-center rounded-md bg-white shadow-md	">
        <Tabs.Root defaultValue="tab0" className="flex w-80 flex-col  divide-y">
          <Tabs.List aria-label="login" className="flex">
            {tabs.map((tab, i) => {
              return (
                <Tabs.Trigger
                  key={i}
                  value={"tab" + i}
                  className="tabs-trigger"
                >
                  {tab.label}
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>
          {tabs.map((tab, i) => {
            return (
              <Tabs.Content key={i} value={"tab" + i} className="p-5">
                {tab.content}
              </Tabs.Content>
            );
          })}
        </Tabs.Root>
      </div>
    </div>
  );
}

export default LoginPage;
