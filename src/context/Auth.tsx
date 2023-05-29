import { createContext, useContext, useLayoutEffect, useState } from "react";
import { getToken, removeToken } from "../utils";

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
  const token = getToken();

  useLayoutEffect(() => {
    async function getUser() {
      if (token) {
        const body = {
          token,
        };
        const res = await fetch(process.env.AUTH_ENDPOINT + "me", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (res.status === 200) {
          const { user } = await res.json();
          const { username, id } = user;
          setUser({
            username,
            id,
          });
        } else {
          removeToken();
          setUser(null);
        }
      }
    }
    getUser();
  }, [token]);

  const ctx = {
    user,
    setUser,
  };

  return (
    <AutuContext.Provider value={ctx}>
      {(!token || user) && children}
    </AutuContext.Provider>
  );
}

export function useAuth() {
  return useContext(AutuContext);
}
