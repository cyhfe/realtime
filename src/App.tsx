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
import { AuthProvider, useAuth } from "./context/Auth";
import { useEffect, useLayoutEffect } from "react";
import { getToken } from "./utils";
function RequireAuth({ children }: { children: JSX.Element }) {
  let ctx = useAuth();

  if (!ctx.user) {
    console.log(ctx.user);
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
