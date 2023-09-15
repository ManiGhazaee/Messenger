import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import SignupPage from "./pages/SignupPage";
import MessengerPage from "./pages/MessengerPage";
import { useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import useSocket from "./components/useSocket";

export const TOKEN_STORAGE_KEY = "TOKEN";

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

    useEffect(() => {
        const newSocket = io("ws://localhost:8080");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useSocket(socket, "menu", (data: { success: boolean; message: string; user: User }) => {
        console.log("menu data", data);

        if (!data.success) {
            navigate("/login");
        } else if (data && "user" in data && data.user) {
            setMenu(data.user);
            setUsername(data.user.username);
        }
    });

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, []);

    useEffect(() => {
        if (socket && token) {
            socket.emit("join", { token });
            socket.emit("menu", { token });
        }
    }, [socket]);

    return (
        <Routes>
            <Route
                path="/messenger"
                element={<MessengerPage socket={socket} menu={menu} token={token} username={username} />}
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
