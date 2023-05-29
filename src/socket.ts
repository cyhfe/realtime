import { io } from "socket.io-client";
import { getToken } from "./utils";

const URL = process.env.AUTH_ENDPOINT;

console.log(URL);

export const socket = io(URL, {
  autoConnect: false,
  auth: {
    token: getToken(),
  },
});
