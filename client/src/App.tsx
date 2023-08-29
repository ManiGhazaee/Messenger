import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import SignupPage from "./pages/SignupPage";
import MessengerPage from "./pages/MessengerPage";

export const TOKEN_STORAGE_KEY = "authToken";
export const ID_STORAGE_KEY = "id";

function App() {
    const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY));
    const [id, setId] = useState(localStorage.getItem(ID_STORAGE_KEY));

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

    return (
        <div>
            <BrowserRouter>
                {socket && (
                    <Routes>
                        <Route path="/messenger" element={<MessengerPage socket={socket} />} />
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
                    </Routes>
                )}
            </BrowserRouter>
        </div>
    );
}

export default App;
