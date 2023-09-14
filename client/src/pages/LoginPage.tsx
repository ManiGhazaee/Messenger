import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { Socket } from "socket.io-client";

const LoginPage = ({
    Data,
    socket,
}: {
    Data: {
        setToken: (string: string) => void;
        setUsername: (string: string) => void;
    };
    socket: Socket | null;
}) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setisLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.on(
                "login",
                (data: {
                    token: string;
                    id: string;
                    username: string;
                    success: boolean;
                    message: string;
                }) => {
                    console.log("login data", data);
                    if (data.token && data.id) {
                        Data.setToken(data.token);
                        Data.setUsername(data.username);
                        navigate("/messenger");
                        window.location.reload();
                    } else {
                        setMessage(data.message);
                    }
                }
            );
        }
    }, [socket]);

    const handleLogin = () => {
        setisLoading(true);
        try {
            if (socket) {
                socket.emit("login", { username_or_email: usernameOrEmail, password });
            }
        } catch (error) {
            console.error("login error", error);
        }
    };
    return (
        <>
            <Link to={"/"}>
                <div
                    id="logo-cont"
                    className="inline-block relative text-[24px] left-1/2 -translate-x-1/2 font-bold mx-auto mt-[12px]"
                >
                    Messenger
                </div>
            </Link>
            <div className="min-h-fit w-[300px] mx-auto text-[14px]">
                <div className="relative bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-[34px] font-bold mb-[30px] text-center mt-[60px]">
                        Log In
                    </h2>
                    <div className="mb-4">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-blue-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Username or Email"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-blue-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-blue-500"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-[6px] px-4 rounded focus:outline-none focus:shadow-outline w-full transition"
                            type="button"
                            onClick={handleLogin}
                        >
                            {isLoading ? (
                                <div className="w-full block h-[21px]">
                                    <div className="absolute left-1/2 -translate-x-1/2">
                                        <Loading />
                                    </div>
                                </div>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-[20px]">
                        <span className="text-text_2">Don't have an account? </span>
                        <Link to="/signup" className="text-blue-500 hover:text-blue-600">
                            Signup
                        </Link>
                    </div>
                    <div className="text-center mt-[20px] text-red-600 w-full overflow-hidden">
                        {message}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
