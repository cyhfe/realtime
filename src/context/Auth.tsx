import { createContext, useEffect, useLayoutEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT;

const AutuContext = createContext(null);

interface User {
  username: string;
  id: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // const login = (body) => {
  //   const user = fetch(AUTH_ENDPOINT + '/signin',{
  //     body
  //   })
  // };
  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem("k");
  // };

  const ctx = {
    user,
  };

  useLayoutEffect(() => {
    // const token = getToken();
    // if (token) {
    //   const user = request("/me", {
    //     token,
    //   });
    //   setUser(user);
    // }
  }, []);

  return <AutuContext.Provider value={ctx}>{children}</AutuContext.Provider>;
}
