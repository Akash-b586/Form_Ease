import { io } from "socket.io-client";

// initializing the socket connection
let socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:9000");

export default socket;
