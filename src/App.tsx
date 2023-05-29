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
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
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
        element: <Navigate to="chat" />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
