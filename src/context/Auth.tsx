import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { getToken, removeToken, requestAuth } from "../utils";

const AutuContext = createContext<AuthContextValue | null>(null);
interface User {
  username: string;
  id: string;
  avatar: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  online: boolean;
  setOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [online, setOnline] = useState(false);
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
          const { username, id, avatar } = user;

          setUser({
            username,
            id,
            avatar,
          });
        } else {
          logout();
        }
      }
    }
    getUser();
  }, [token]);

  const ctx = useMemo(() => {
    return {
      user,
      setUser,
      logout,
      online,
      setOnline,
    };
  }, [online, user]);

  return (
    <AutuContext.Provider value={ctx}>
      {(!token || user) && children}
    </AutuContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AutuContext);
  if (!ctx) throw Error("useAuth should used in AuthProvider");
  return ctx;
}
