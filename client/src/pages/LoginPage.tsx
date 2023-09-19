import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { Socket } from "socket.io-client";

interface Credentials {
    usernameOrEmail: string;
    password: string;
}

type CredentialsKeys = keyof Credentials;

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
    const [credentials, setCredentials] = useState<Credentials>({
        usernameOrEmail: "",
        password: "",
    });

    const changeCredentials = useCallback((key: CredentialsKeys, newValue: string) => {
        setCredentials((prev) => ({ ...prev, [key]: newValue }));
    }, []);

    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.on(
                "login",
                (data: { token: string; id: string; username: string; success: boolean; message: string }) => {
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
                socket.emit("login", {
                    username_or_email: credentials.usernameOrEmail,
                    password: credentials.password,
                });
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
                    className="inline-block scale_opacity_anim_300_0_origin relative text-[24px] left-1/2 -translate-x-1/2 font-bold mx-auto mt-[12px]"
                >
                    Messenger
                </div>
            </Link>
            <div className="min-h-fit w-[300px] mx-auto text-[14px]">
                <div className="relative bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-[34px] scale_opacity_anim_300 anim_delay_100 font-bold mb-[30px] text-center mt-[60px]">
                        Log In
                    </h2>
                    <div className="mb-4">
                        <input
                            className="scale_opacity_anim_300 anim_delay_200 appearance-none outline-none border-[2px] w-full h-[42px] py-2 px-3 placeholder:text-zinc-500 focus:placeholder:text-blue-500 bg-black rounded-[12px] border-zinc-800 leading-tight focus:outline-none focus:border-blue-500 duration-150"
                            type="text"
                            placeholder="Username or Email"
                            value={credentials.usernameOrEmail}
                            onChange={(e) => changeCredentials("usernameOrEmail", e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            className="scale_opacity_anim_300 anim_delay_300 appearance-none outline-none border-[2px] w-full h-[42px] py-2 px-3 placeholder:text-zinc-500 focus:placeholder:text-blue-500 bg-black rounded-[12px] border-zinc-800 leading-tight focus:outline-none focus:border-blue-500 duration-150"
                            type="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={(e) => changeCredentials("password", e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div
                            className={`scale_opacity_anim_300 anim_delay_400 relative z-[100] button_shadow shadow-blue-500 border-[2px] ${
                                isLoading ? "bg-blue-500" : "bg-black"
                            } border-blue-500 hover:cursor-pointer select-none w-[calc(100%+4rem)] rounded-[12px] h-[42px] py-2 text-[14px] text-blue-500 font-bold mx-auto hover:shadow-none duration-200 text-center hover:bg-blue-500 hover:text-black`}
                            onClick={handleLogin}
                        >
                            {isLoading ? (
                                <div className="w-full block h-[21px]">
                                    <div className="absolute left-1/2 -translate-x-1/2">
                                        <Loading />
                                    </div>
                                </div>
                            ) : (
                                "Log In"
                            )}
                        </div>
                    </div>
                    <div className="flex items-center scale_opacity_anim_300 anim_delay_500 justify-between mt-[20px]">
                        <span className="text-text_2">Don't have an account? </span>
                        <Link to="/signup" className="text-blue-500 hover:text-blue-600">
                            Signup
                        </Link>
                    </div>
                    <div className="text-center mt-[20px] text-red-600 w-full overflow-hidden">{message}</div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
