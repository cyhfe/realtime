import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import Layout from "./Layout";
import Chat from "./pages/chat";
import Login from "./pages/login";
import Canvas from "./pages/canvas";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/Auth";
function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = false;
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/chat" />,
      },
      {
        path: "/chat",
        element: (
          <div>
            chat
            <Outlet />
          </div>
        ),
        children: [
          {
            path: "/chat/:channelId",
            element: <div>chat: 1</div>,
          },
        ],
      },
      {
        path: "/canvas",
        element: <div>canvas</div>,
      },
      {
        path: "*",
        element: <div>404 NOT FOUND</div>,
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
