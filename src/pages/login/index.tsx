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
          <input className="Input" type="text" required />
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
          <input type="password" required />
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
          <input className="Input" type="text" required />
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
          <input type="password" required />
        </Form.Control>
      </Form.Field>
      <Form.Submit asChild>
        <button className="Button">登录</button>
      </Form.Submit>
    </Form.Root>
  );
}

function LoginPage() {
  const ctx = useAuth();

  if (ctx.user) {
    debugger;
    return <Navigate to={"/chat"} />;
  }
  return (
    <Tabs.Root defaultValue="tab1">
      <Tabs.List aria-label="login">
        <Tabs.Trigger value="tab1">登录</Tabs.Trigger>
        <Tabs.Trigger value="tab2">注册</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <Login />
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <Signup />
      </Tabs.Content>
    </Tabs.Root>
  );
}

export default LoginPage;
