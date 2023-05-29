import { AuthProvider } from "./context/Auth";

import Router from "./router";

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
