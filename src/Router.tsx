import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import Layout from "./Layout";

import Login from "./pages/login";

import { useAuth } from "./context/Auth";
import Chat from "./pages/chat";
import { ChatIndex, ChatPrivate, ChatChannel } from "./pages/chat/Chat";
import Canvas from "./pages/canvas";
import { Music } from "./pages/music";
import OpenAi from "./pages/openai";
import AiChat from "./pages/openai/chat";
import Images from "./pages/openai/Images";

function RequireAuth({ children }: { children: JSX.Element }) {
  let ctx = useAuth();

  if (!ctx.user) {
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
        element: <Chat />,
        children: [
          {
            index: true,
            element: <ChatIndex />,
          },

          {
            path: "/chat/private/:toUserId",
            element: <ChatPrivate />,
          },
          {
            path: "/chat/channel/:channelId",
            element: <ChatChannel />,
          },
        ],
      },
      {
        path: "/canvas",
        element: <Canvas />,
      },
      {
        path: "/music",
        element: <Music />,
      },
      {
        path: "/openai",
        element: <OpenAi />,
        children: [
          {
            index: true,
            element: <Navigate to="/openai/chat" />,
          },
          {
            path: "/openai/chat",
            element: <AiChat />,
            children: [
              {
                index: true,
                element: <div>请创建或选择一个对话</div>,
              },
              {
                path: "/openai/chat/:conversationId",
                element: <div>conversation</div>,
              },
            ],
          },
          {
            path: "/openai/images",
            element: <Images />,
          },
        ],
      },
      {
        path: "*",
        element: <div>404 NOT FOUND</div>,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
