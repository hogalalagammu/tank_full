import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from '../socket.js';

const GameScreen = () => {
    const arenaWidth = 900;
    const arenaHeight = 700;
    const tankSize = 60;
    const bulletSize = 15;
    const bulletSpeed = 3;
    const navigate = useNavigate();
    const walls = [
        { x: 200, y: 0, width: 20, height: 200 },
        { x: 600, y: 300, width: 100, height: 20 },
        { x: 600, y: 0, width: 20, height: 500 },
        { x: 400, y: 400, width: 20, height: 300 },
        { x: 0, y: 0, width: 900, height: 20 },
        { x: 0, y: 0, width: 20, height: 700 },
        { x: 880, y: 0, width: 20, height: 700 },
        { x: 0, y: 688, width: 900, height: 20 },
    ];

    // const socket = useRef(null);
    const activeKeys = useRef(new Set());

    const positionRef1 = useRef({ x: 50, y: 50, rotation: 0 });
    const positionRef2 = useRef({ x: 750, y: 600, rotation: 180 });

    const [bulletsPlayer1, setBulletsPlayer1] = useState([]);
    const [bulletsPlayer2, setBulletsPlayer2] = useState([]);

    const [scorePlayer1, setScorePlayer1] = useState(0); // Score for Player 1
    const [scorePlayer2, setScorePlayer2] = useState(0); // Score for Player 2
    // const [isHost, setIsHost] = useState(false);
    const isHost = useRef(false);

    // Collision Detection
    const checkCollision = (x, y, tankSize) => {
        for (const wall of walls) {
            if (
                x < wall.x + wall.width &&
                x + tankSize > wall.x &&
                y < wall.y + wall.height &&
                y + tankSize > wall.y
            ) {
                return true;
            }
        }
        return false;
    };
    const isTankCollision = (x1, y1, x2, y2, size) => {
        const overlapX = Math.abs(x1 - x2) < size;
        const overlapY = Math.abs(y1 - y2) < size;
        return overlapX && overlapY;
    };

    // Handle Key Down
    const handleKeyDown = (e) => {
        activeKeys.current.add(e.key);

        if (e.key === " ") {
            // Determine which tank should fire
            if (isHost.current) {
                // Host (Tank 1) fires
                const { x, y, rotation } = positionRef1.current;
                const bulletX =
                    x + tankSize / 2 - bulletSize / 2 + Math.cos((rotation * Math.PI) / 180) * (tankSize / 2);
                const bulletY =
                    y + tankSize / 2 - bulletSize / 2 + Math.sin((rotation * Math.PI) / 180) * (tankSize / 2);

                const newBullet = { x: bulletX, y: bulletY, rotation, player: 1 };
                setBulletsPlayer1((prev) => [...prev, newBullet]);

                // Send bullet event to the server
                socket.emit("fireBullet", newBullet);
            } else {
                // Non-host (Tank 2) fires
                const { x, y, rotation } = positionRef2.current;
                const bulletX =
                    x + tankSize / 2 - bulletSize / 2 + Math.cos((rotation * Math.PI) / 180) * (tankSize / 2);
                const bulletY =
                    y + tankSize / 2 - bulletSize / 2 + Math.sin((rotation * Math.PI) / 180) * (tankSize / 2);

                const newBullet = { x: bulletX, y: bulletY, rotation, player: 2 };
                setBulletsPlayer2((prev) => [...prev, newBullet]);

                // Send bullet event to the server
                socket.emit("fireBullet", newBullet);
            }
        }
    };

    const handleKeyUp = (e) => {
        activeKeys.current.delete(e.key);
    };

    const updatePosition = (tankRef, player) => {


        if ((isHost.current && player === 1) || (!isHost.current && player === 2)) {
            // console.log(player + " -------------- " + isHost.current);
            const { x, y, rotation } = tankRef.current;
            let newX = x;
            let newY = y;
            let newRotation = rotation;

            // Move forward or backward
            if (activeKeys.current.has("w")) {
                // console.log(player);

                newX += Math.cos((rotation * Math.PI) / 180) * 2;
                newY += Math.sin((rotation * Math.PI) / 180) * 2;
            }
            if (activeKeys.current.has("s")) {
                newX -= Math.cos((rotation * Math.PI) / 180) * 2;
                newY -= Math.sin((rotation * Math.PI) / 180) * 2;
            }

            // Rotate
            if (activeKeys.current.has("a")) {
                newRotation -= 2;
                if (newRotation < 0) newRotation += 360;
            }
            if (activeKeys.current.has("d")) {
                newRotation += 2;
                if (newRotation >= 360) newRotation -= 360;
            }

            // Check for tank-to-tank collision
            const otherTankRef = player === 1 ? positionRef2 : positionRef1;
            const otherTank = otherTankRef.current;

            if (isTankCollision(newX, newY, otherTank.x, otherTank.y, tankSize)) {
                if (Math.abs(newX - otherTank.x) > Math.abs(newY - otherTank.y)) {
                    newX = x;
                } else {
                    newY = y;
                }
            }

            const collided = checkCollision(newX, newY, tankSize);
            if (
                newX >= 0 &&
                newX + tankSize <= arenaWidth &&
                newY >= 0 &&
                newY + tankSize <= arenaHeight &&
                !collided
            ) {
                tankRef.current = { x: newX, y: newY, rotation: newRotation };
                socket.emit("playerMove", {
                    x: newX,
                    y: newY,
                    rotation: newRotation,
                    player,
                });
            } else {
                tankRef.current.rotation = newRotation;
            }
        }
    };


    const updateGame = () => {
        updatePosition(positionRef1, 1);
        updatePosition(positionRef2, 2);

        // Bullet movement logic remains the same


        setBulletsPlayer1((prevBullets) =>
            prevBullets
                .map((bullet) => {
                    const newX = bullet.x + Math.cos((bullet.rotation * Math.PI) / 180) * bulletSpeed;
                    const newY = bullet.y + Math.sin((bullet.rotation * Math.PI) / 180) * bulletSpeed;

                    if (checkCollision(newX, newY, bulletSize)) {
                        return null;
                    }

                    const hitTank2 = isTankCollision(newX, newY, positionRef2.current.x, positionRef2.current.y, tankSize);
                    if (hitTank2) {
                        // setScorePlayer1((prev) => prev + 0.5);
                        console.log("t2");
                        if (isHost.current) socket.emit("tankHit", { player: 2 });
                        return null;
                    }

                    return { ...bullet, x: newX, y: newY };
                })
                .filter((bullet) => bullet !== null)
        );

        setBulletsPlayer2((prevBullets) =>
            prevBullets
                .map((bullet) => {
                    const newX = bullet.x + Math.cos((bullet.rotation * Math.PI) / 180) * bulletSpeed;
                    const newY = bullet.y + Math.sin((bullet.rotation * Math.PI) / 180) * bulletSpeed;

                    if (checkCollision(newX, newY, bulletSize)) {
                        return null;
                    }

                    const hitTank1 = isTankCollision(newX, newY, positionRef1.current.x, positionRef1.current.y, tankSize);
                    if (hitTank1) {
                        // setScorePlayer2((prev) => prev + 0.5);
                        console.log("t1");

                        if (!isHost.current) socket.emit("tankHit", { player: 1 });
                        return null;
                    }

                    return { ...bullet, x: newX, y: newY };
                })
                .filter((bullet) => bullet !== null)
        );



        requestAnimationFrame(updateGame);
    };

    useEffect(() => {
        // socket = io("http://localhost:5000");
        console.log("check");

        socket.emit("checkHost");
        socket.on("noh", (k) => {
            if (k === true) {
                console.log("hoho");

                navigate("/room");
            }
        });
        socket.on("setHost", (status) => {
            // setIsHost(status);  // Store host status
            isHost.current = status;
            console.log("Am I the host?", status);
        });
        socket.on("scoreUpdate", ({ score1, score2 }) => {
            console.log("hi");

            setScorePlayer1(score1);
            setScorePlayer2(score2);
            if (isHost.current) {
                if (score1 >= 25) {
                    navigate('/win');
                }
                if (score2 >= 25) {
                    navigate('/loss');
                }
            }
            else {
                if (score1 >= 25) {
                    navigate('/loss');
                }
                if (score2 >= 25) {
                    navigate('/win');
                }
            }
        });
        socket.on("updatePosition", (data) => {
            if (data.player === 1) positionRef1.current = data;
            if (data.player === 2) positionRef2.current = data;
        });
        socket.on("bulletFired", (data) => {
            if (data.player === 1) {
                setBulletsPlayer1((prev) => [...prev, data]);
            } else if (data.player === 2) {
                setBulletsPlayer2((prev) => [...prev, data]);
            }
        }, []);

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        requestAnimationFrame(updateGame);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            socket.off("setHost");
            socket.off("scoreUpdate");
        };
    }, []);

    return (
        <div className="bg-gradient-to-b from-blue-500 to-blue-800 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-white text-4xl font-bold mb-6 text-center">Tank Battle Arena</h1>
            {/* <div className="flex justify-between w-full max-w-md mb-4">
                <div className="text-white text-xl">Player 1 Score: {scorePlayer1}</div>
                <div className="text-white text-xl">Player 2 Score: {scorePlayer2}</div>
            </div> */}
            <div className="flex gap-20">
                <div className="relative flex flex-col items-center justify-center text-white text-xl">
                    <img
                        src="/image/red.png"
                        alt="Tank 1"

                        style={{
                            width: "200px",
                            height: "200px",
                        }}
                    />
                    <div className="mt-4"> {/* Add margin-top for gap */}
                        Player 1 Score: {scorePlayer1}
                    </div>
                </div>
                <div
                    className="relative bg-white border-4 border-green-700"
                    style={{
                        width: `${arenaWidth}px`,
                        height: `${arenaHeight}px`,
                    }}
                >
                    {walls.map((wall, index) => (
                        <div
                            key={index}
                            className="absolute bg-black"
                            style={{
                                top: `${(wall.y / arenaHeight) * 100}%`,
                                left: `${(wall.x / arenaWidth) * 100}%`,
                                width: `${(wall.width / arenaWidth) * 100}%`,
                                height: `${(wall.height / arenaHeight) * 100}%`,
                            }}
                        />
                    ))}

                    <img
                        src="/image/red.png"
                        alt="Tank 1"
                        className="absolute"
                        style={{
                            top: `${(positionRef1.current.y / arenaHeight) * 100}%`,
                            left: `${(positionRef1.current.x / arenaWidth) * 100}%`,
                            width: `${(tankSize / arenaWidth) * 100}%`,
                            height: `${(tankSize / arenaHeight) * 100}%`,
                            transform: `rotate(${positionRef1.current.rotation}deg)`,
                        }}
                    />
                    <img
                        src="/image/blue1.png"
                        alt="Tank 2"
                        className="absolute"
                        style={{
                            top: `${(positionRef2.current.y / arenaHeight) * 100}%`,
                            left: `${(positionRef2.current.x / arenaWidth) * 100}%`,
                            width: `${(tankSize / arenaWidth) * 100}%`,
                            height: `${(tankSize / arenaHeight) * 100}%`,
                            transform: `rotate(${positionRef2.current.rotation}deg)`,
                        }}
                    />
                    {bulletsPlayer1.map((bullet, index) => (
                        <div
                            key={`player1-${index}`}
                            className="absolute bg-red-500 rounded-full"
                            style={{
                                top: `${bullet.y}px`,
                                left: `${bullet.x}px`,
                                width: `${bulletSize}px`,
                                height: `${bulletSize}px`,
                            }}
                        />
                    ))}
                    {bulletsPlayer2.map((bullet, index) => (
                        <div
                            key={`player2-${index}`}
                            className="absolute bg-blue-500 rounded-full"
                            style={{
                                top: `${bullet.y}px`,
                                left: `${bullet.x}px`,
                                width: `${bulletSize}px`,
                                height: `${bulletSize}px`,
                            }}
                        />
                    ))}
                </div>
                <div className="relative flex flex-col items-center justify-center text-white text-xl">
                    <img
                        src="/image/blue1.png"
                        alt="Tank 2"

                        style={{
                            width: "200px",
                            height: "200px",
                        }}
                    />
                    <div className="mt-4"> {/* Add margin-top for gap */}
                        Player 2 Score: {scorePlayer2}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GameScreen;
