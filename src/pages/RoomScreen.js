import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
import socket from "../socket";

// const socket = io("http://localhost:5000"); // Connect to backend

const RoomScreen = () => {
    const [roomKey, setRoomKey] = useState("");
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isJoiningRoom, setIsJoiningRoom] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Room created event from server
        socket.on("roomCreated", (key) => {
            setRoomKey(key);
            setIsCreatingRoom(true);
        });

        // Opponent joined event
        // socket.on("playerJoined", () => {

        //     navigate("/game"); // Start game
        // });
        socket.on("startGame", () => {
            setIsWaiting(false);
            console.log("Game starting...");  // 🟢 Debug log
            navigate("/game"); // Redirect to game screen
        });

        // Error handling
        socket.on("error", (msg) => {
            alert(msg);
        });

        return () => {
            socket.off("roomCreated");
            socket.off("startGame");
            socket.off("playerJoined");
            socket.off("error");
        };
    }, [navigate]);

    // Create a room
    const createRoom = () => {
        socket.emit("createRoom");
    };

    // Copy room key to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Join a room
    const joinRoom = () => {
        if (roomKey.trim()) {
            socket.emit("joinRoom", roomKey);
        } else {
            alert("Enter a valid room key!");
        }
    };

    return (
        <div className="bg-gradient-to-b from-blue-500 to-blue-800 h-screen flex flex-col items-center justify-center">
            <h1 className="text-white text-6xl font-bold mb-8">Tank Game</h1>

            {!isCreatingRoom && !isJoiningRoom && (
                <div className="flex gap-4">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-2 px-8 rounded-lg shadow-lg"
                        onClick={createRoom}
                    >
                        Create Room
                    </button>
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-2 px-8 rounded-lg shadow-lg"
                        onClick={() => setIsJoiningRoom(true)}
                    >
                        Join Room
                    </button>
                </div>
            )}

            {isCreatingRoom && (
                <div className="mt-6 text-center">
                    <p className="text-xl font-semibold text-white">Your Room Key:</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-2xl font-bold text-black mt-2 bg-white px-4 py-2 rounded-lg">{roomKey}</p>
                        <button className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400" onClick={copyToClipboard}>
                            📋
                        </button>
                    </div>
                    {copied && <p className="text-green-300 text-sm mt-2">Copied to clipboard!</p>}
                    <p className="text-lg mt-4 text-white">Waiting for another player...</p>
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mt-4"></div>
                </div>
            )}

            {isJoiningRoom && (
                <div className="mt-6 text-center">
                    <p className="text-xl font-semibold text-white mb-4">Enter Room Key:</p>
                    <input
                        className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        value={roomKey}
                        onChange={(e) => setRoomKey(e.target.value)}
                        placeholder="Enter room key"
                    />
                    <button
                        className="px-6 py-3 mt-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                        onClick={joinRoom}
                    >
                        Join Room
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoomScreen;
