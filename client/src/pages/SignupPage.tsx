import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { Socket } from "socket.io-client";

const SignupPage = ({
    Data,
    socket,
}: {
    Data: {
        setToken: (string: string) => void;
        setUsername: (string: string) => void;
    };
    socket: Socket | null;
}) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setisLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.on(
                "signup",
                (data: {
                    token?: string;
                    id?: string;
                    username?: string;
                    message: string;
                    success: boolean;
                }) => {
                    console.log("signup data", data);

                    if (data.token && data.id && data.username) {
                        Data.setToken(data.token);
                        Data.setUsername(data.username);
                        navigate("/messenger");
                        window.location.reload();
                    } else {
                        setMessage(data.message);
                        setisLoading(false);
                    }
                }
            );
        }
    }, [socket]);

    const handleSignUp = () => {
        setisLoading(true);
        try {
            if (password !== confirmPassword) {
                setMessage(
                    "Password and confirm password do not match. Please make sure you enter the same password in both fields."
                );
                setisLoading(false);
                return;
            }

            if (socket) {
                socket.emit("signup", { username, email, password });
            }
            console.log(socket);
        } catch (error) {
            console.error("Sign-up failed:", error);
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
                        Sign Up
                    </h2>
                    <div className="mb-4">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-blue-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-blue-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-blue-500"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-blue-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-blue-500"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            className="appearance-none border w-full py-2 px-3 placeholder:text-text_2 focus:placeholder:text-blue-500 bg-black rounded border-borders leading-tight focus:outline-none focus:border-blue-500"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-[6px] px-4 rounded focus:outline-none focus:shadow-outline w-full transition"
                            type="button"
                            onClick={handleSignUp}
                        >
                            {isLoading ? (
                                <div className="w-full block h-[21px]">
                                    <div className="absolute left-1/2 -translate-x-1/2">
                                        <Loading />
                                    </div>
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-[20px]">
                        <span className="text-text_2">Already have an account? </span>
                        <Link to="/login" className="text-blue-500 hover:text-blue-600">
                            Login
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

export default SignupPage;
