import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { getToken, removeToken, requestAuth } from "../utils";

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

  function logout() {
    removeToken();
    setUser(null);
  }

  useLayoutEffect(() => {
    async function getUser() {
      if (token) {
        const body = {
          token,
        };
        const res = await requestAuth("me", {
          method: "post",
          data: body,
        });
        if (res.status === 200) {
          const { user } = await res.json();
          const { username, id } = user;
          setUser({
            username,
            id,
          });
        } else {
          logout();
        }
      }
    }
    getUser();
  }, []);

  const ctx = useMemo(() => {
    return {
      user,
      setUser,
      logout,
    };
  }, [user]);

  return (
    <AutuContext.Provider value={ctx}>
      {(!token || user) && children}
    </AutuContext.Provider>
  );
}

export function useAuth() {
  return useContext(AutuContext);
}
