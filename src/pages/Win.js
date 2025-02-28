import React from "react";
import { useNavigate } from "react-router-dom";

const Win = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-500 text-white">
            <h1 className="text-5xl font-bold mb-4 animate-bounce">🎉 You Win! 🎉</h1>
            <p className="text-xl mb-6">Great job! Play again?</p>
            <div className="flex gap-4">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg"
                    onClick={() => navigate("/room")}
                >
                    Play Again
                </button>

            </div>
        </div>
    );
};

export default Win;
