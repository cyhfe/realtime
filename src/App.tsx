import { AuthProvider } from "./context/Auth";
import { Music } from "./pages/music";
import Router from "./Router";

export default function App() {
  return (
    // <AuthProvider>
    //   <Router />
    // </AuthProvider>
    <Music />
  );
}
