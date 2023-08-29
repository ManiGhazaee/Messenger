import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import SignupPage from "./pages/SignupPage";
import MessengerPage from "./pages/MessengerPage";
import { useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

export const TOKEN_STORAGE_KEY = "authToken";
export const ID_STORAGE_KEY = "id";

function App() {
    const navigate = useNavigate();
    const tokenLs = localStorage.getItem(TOKEN_STORAGE_KEY);
    const idLs = localStorage.getItem(ID_STORAGE_KEY);

    if (tokenLs == null || idLs == null) {
        navigate("/login");
    }

    const [token, setToken] = useState(tokenLs);
    const [id, setId] = useState(idLs);
    const [menu, setMenu] = useState<User | null>(null);

    const changeToken = (string: string) => {
        setToken(string);
    };
    const changeId = (string: string) => {
        setId(string);
    };

    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        if (id) {
            localStorage.setItem(ID_STORAGE_KEY, id);
        } else {
            localStorage.removeItem(ID_STORAGE_KEY);
        }
    }, [token, id]);

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io("ws://localhost:8080");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket && token && id) {
            socket.on("menu", (data: { success: boolean; message: string; user: User }) => {
                console.log(data);
                setMenu(data.user);
            });
            socket.emit("menu", { token, id });
        }
    }, [socket]);

    return (
        <Routes>
            <Route path="/messenger" element={<MessengerPage socket={socket} menu={menu} />} />
            <Route
                path="/signup"
                element={
                    <SignupPage
                        Data={{
                            token: token || "",
                            setTokenFunction: changeToken,
                            id: id || "",
                            setIdFunction: changeId,
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
                            token: token || "",
                            setTokenFunction: changeToken,
                            id: id || "",
                            setIdFunction: changeId,
                        }}
                        socket={socket}
                    />
                }
            />
        </Routes>
    );
}

export default App;
