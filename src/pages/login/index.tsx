import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { setToken } from "../../utils";
import { useAuth } from "../../context/Auth";
const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT;
function Login() {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [serverError, setServerError] = useState("");
  const { setUser, user } = useAuth();
  const navigate = useNavigate();
  if (user) {
    return <Navigate to={"/chat"} />;
  }
  return (
    <div>
      {serverError}
      name
      <input type="text" ref={nameRef} />
      password
      <input type="password" ref={passwordRef} />
      <button
        onClick={async () => {
          const body = {
            username: nameRef.current?.value,
            password: passwordRef.current?.value,
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
            setUser({
              username: data.user,
              id: data.id,
            });
            console.log(data.user);
            setToken(data.token);
            navigate("/chat");
          }
        }}
      >
        login
      </button>
    </div>
  );
}

export default Login;
