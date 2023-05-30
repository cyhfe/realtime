import { AuthProvider } from "./context/Auth";
import Router from "./Router";

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
