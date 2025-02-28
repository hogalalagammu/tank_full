import React from "react";
import { useNavigate } from "react-router-dom";
const GameHomePage = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-gradient-to-b from-blue-500 to-blue-800 h-screen flex flex-col items-center justify-center">
            <h1 className="text-white text-6xl font-bold mb-8">Clash of Tanks</h1>

            <div className="flex flex-col items-center mb-8">
                <label className="text-white text-xl mb-2" htmlFor="username">
                    Name
                </label>
                <input
                    id="username"
                    type="text"
                    placeholder="Enter your name"
                    className="px-4 py-2 rounded-lg shadow-md text-center text-blue-800 font-bold"
                    defaultValue="Guest1341"
                />
            </div>
            <div className="flex flex-col gap-4">
                <button className="bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-2 px-8 rounded-lg shadow-lg"
                    onClick={() => navigate("/room")}
                >
                    Start Battle
                </button>

            </div>

            <div className="absolute bottom-4 left-4 flex gap-4">
                <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                    🎵
                </button>
                <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                    🔊
                </button>
            </div>
        </div>
    );
};

export default GameHomePage;

