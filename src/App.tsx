import { AuthProvider } from "./context/Auth";
import Router from "./Router";
import WebRtc from "./pages/webrtc";
export default function App() {
  return (
    // <AuthProvider>
    //   <Router />
    // </AuthProvider>
    <WebRtc />
  );
}
