import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import SignupPage from "./pages/SignupPage";
import MessengerPage from "./pages/MessengerPage";
import { useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import useSocket from "./components/useSocket";
import LandingPage from "./pages/LandingPage";

export const TOKEN_STORAGE_KEY = "TOKEN";
const SOCKET_URL = "ws://localhost:8080";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting" | "connection_error";

function App() {
    const navigate = useNavigate();
    const tokenLs = localStorage.getItem(TOKEN_STORAGE_KEY);

    const changeToken = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    };

    const [token, setToken] = useState(tokenLs);
    const [username, setUsername] = useState<string | null>(null);
    const [menu, setMenu] = useState<User | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
    const [verified, setVerified] = useState<boolean>(false);

    const memoizedMenu = useMemo(() => menu, [menu]);
    const memoizedUsername = useMemo(() => username, [username]);
    const memoizedSocket = useMemo(() => socket, [socket]);
    const memoizedToken = useMemo(() => token, [token]);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            setConnectionStatus("connected");
        });

        newSocket.on("disconnect", () => {
            setConnectionStatus("disconnected");
        });

        newSocket.on("reconnecting", () => {
            setConnectionStatus("reconnecting");
        });

        newSocket.on("reconnect", () => {
            setConnectionStatus("connected");
        });

        newSocket.on("reconnect_error", () => {
            setConnectionStatus("connection_error");
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useSocket(socket, "menu", (data: { success: boolean; message: string; user: User }) => {
        console.log("menu data", data);

        if (!data.success) {
            navigate("/signup");
        } else if (data && "user" in data && data.user) {
            setMenu(data.user);
            setUsername(data.user.username);
        }
        setVerified(true);
    });

    useEffect(() => {
        if (socket) {
            socket.emit("join", { token });
            socket.emit("menu", { token });
        }
    }, [socket]);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <LandingPage
                        connectionStatus={connectionStatus}
                        token={memoizedToken}
                        username={memoizedUsername}
                        verified={verified}
                    />
                }
            />
            <Route
                path="/messenger"
                element={
                    <MessengerPage
                        socket={memoizedSocket}
                        menu={memoizedMenu}
                        token={memoizedToken}
                        username={memoizedUsername}
                    />
                }
            />
            <Route
                path="/signup"
                element={
                    <SignupPage
                        Data={{
                            setToken: changeToken,
                            setUsername: setUsername,
                        }}
                        socket={socket}
                    />
                }
            />
            <Route
                path="/login"
                element={
                    <LoginPage
                        Data={{
                            setToken: changeToken,
                            setUsername: setUsername,
                        }}
                        socket={socket}
                    />
                }
            />
        </Routes>
    );
}

export default App;
