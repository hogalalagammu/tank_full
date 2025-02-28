import { io } from "socket.io-client";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

const socket = io(SERVER_URL, {
    autoConnect: false,
    transports: ["websocket"], // Ensure WebSocket is used
});

export default socket;

