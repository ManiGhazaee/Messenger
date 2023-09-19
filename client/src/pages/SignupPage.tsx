import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { Socket } from "socket.io-client";

interface Credentials {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

type CredentialsKeys = keyof Credentials;

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
    const [message, setMessage] = useState("");
    const [isLoading, setisLoading] = useState<boolean>(false);
    const [credentials, setCredentials] = useState<Credentials>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const changeCredentials = useCallback((key: CredentialsKeys, newValue: string) => {
        setCredentials((prev) => ({ ...prev, [key]: newValue }));
    }, []);

    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            socket.on(
                "signup",
                (data: { token?: string; id?: string; username?: string; message: string; success: boolean }) => {
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
            if (credentials.password !== credentials.confirmPassword) {
                setMessage(
                    "Password and confirm password do not match. Please make sure you enter the same password in both fields."
                );
                setisLoading(false);
                return;
            }

            if (socket) {
                socket.emit("signup", {
                    username: credentials.username,
                    email: credentials.email,
                    password: credentials.password,
                });
            }
            console.log(socket);
        } catch (error) {
            console.error("Sign-up failed:", error);
            setisLoading(false);
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
                        Sign Up
                    </h2>
                    <div className="mb-4">
                        <input
                            className="scale_opacity_anim_300 anim_delay_200 appearance-none outline-none border-[2px] w-full h-[42px] py-2 px-3 placeholder:text-zinc-500 focus:placeholder:text-blue-500 bg-black rounded-[12px] border-zinc-800 leading-tight focus:outline-none focus:border-blue-500 duration-150"
                            type="text"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={(e) => changeCredentials("username", e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="scale_opacity_anim_300 anim_delay_300 appearance-none outline-none border-[2px] w-full h-[42px] py-2 px-3 placeholder:text-zinc-500 focus:placeholder:text-blue-500 bg-black rounded-[12px] border-zinc-800 leading-tight focus:outline-none focus:border-blue-500 duration-150"
                            type="email"
                            placeholder="Email"
                            value={credentials.email}
                            onChange={(e) => changeCredentials("email", e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="scale_opacity_anim_300 anim_delay_400 appearance-none outline-none border-[2px] w-full h-[42px] py-2 px-3 placeholder:text-zinc-500 focus:placeholder:text-blue-500 bg-black rounded-[12px] border-zinc-800 leading-tight focus:outline-none focus:border-blue-500 duration-150"
                            type="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={(e) => changeCredentials("password", e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            className="scale_opacity_anim_300 anim_delay_500 appearance-none outline-none border-[2px] w-full h-[42px] py-2 px-3 placeholder:text-zinc-500 focus:placeholder:text-blue-500 bg-black rounded-[12px] border-zinc-800 leading-tight focus:outline-none focus:border-blue-500 duration-150"
                            type="password"
                            placeholder="Confirm Password"
                            value={credentials.confirmPassword}
                            onChange={(e) => changeCredentials("confirmPassword", e.target.value)}
                            required={true}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div
                            className={`scale_opacity_anim_300 anim_delay_600 relative z-[100] button_shadow shadow-blue-500 border-[2px] ${
                                isLoading ? "bg-blue-500" : "bg-black"
                            } border-blue-500 hover:cursor-pointer select-none w-[calc(100%+4rem)] rounded-[12px] h-[42px] py-2 text-[14px] text-blue-500 font-bold mx-auto hover:shadow-none duration-200 text-center hover:bg-blue-500 hover:text-black`}
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
                        </div>
                    </div>
                    <div className="scale_opacity_anim_300 anim_delay_700 flex items-center justify-between mt-[20px]">
                        <span className="text-zinc-500">Already have an account? </span>
                        <Link to="/login" className="text-blue-500 hover:text-blue-600">
                            Login
                        </Link>
                    </div>
                    <div className="text-center mt-[20px] text-red-600 w-full overflow-hidden">{message}</div>
                </div>
            </div>
        </>
    );
};

export default SignupPage;
