import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { setToken } from "../../utils";
import { useAuth } from "../../context/Auth";
import * as Tabs from "@radix-ui/react-tabs";
import * as Form from "@radix-ui/react-form";

const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT;

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
    const res = await fetch(AUTH_ENDPOINT + "user", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

  return (
    <Form.Root className="FormRoot" onSubmit={handleSubmit}>
      {serverError && <div>{serverError}</div>}
      <Form.Field className="FormField" name="username">
        <div>
          <Form.Label className="FormLabel">用户名</Form.Label>
          <Form.Message className="FormMessage" match="valueMissing">
            请输入用户名
          </Form.Message>
          <Form.Message className="FormMessage" match="typeMismatch">
            Please provide a valid email
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input
            className="Input"
            type="text"
            required
            autoComplete="username"
          />
        </Form.Control>
      </Form.Field>
      <Form.Field className="FormField" name="password">
        <div>
          <Form.Label className="FormLabel">密码</Form.Label>
          <Form.Message className="FormMessage" match="valueMissing">
            Please enter a question
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input type="password" required autoComplete="current-password" />
        </Form.Control>
      </Form.Field>
      <Form.Submit asChild>
        <button className="Button">注册</button>
      </Form.Submit>
    </Form.Root>
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
    const res = await fetch(AUTH_ENDPOINT + "signin", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
        {serverError && <div>{serverError}</div>}
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
  return (
    <div className="flex h-screen w-full bg-slate-100">
      <div className="m-auto mt-32 flex items-center justify-center rounded-md bg-white shadow">
        <Tabs.Root defaultValue="tab1" className="flex w-80 flex-col  divide-y">
          <Tabs.List aria-label="login" className="flex">
            <Tabs.Trigger value="tab1" className="tabs-trigger">
              登录
            </Tabs.Trigger>
            <Tabs.Trigger value="tab2" className="tabs-trigger">
              注册
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1" className="p-5">
            <Login />
          </Tabs.Content>
          <Tabs.Content value="tab2" className="p-5">
            <Signup />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

export default LoginPage;
