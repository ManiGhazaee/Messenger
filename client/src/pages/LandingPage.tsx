import React from "react";
import { ConnectionStatus } from "../App";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

const LandingPage = ({
    connectionStatus,
    token,
    username,
    verified,
}: {
    connectionStatus: ConnectionStatus;
    token: string | null;
    username: string | null;
    verified: boolean;
}) => {
    return (
        <>
            {token && username && verified ? (
                <div className="text-center">
                    <div className="w-[120px] aspect-square rounded-full mx-auto my-[20px] bg-zinc-800"></div>
                    <div className="text-[34px] mt-[20px] mb-[14px] font-bold">{username}</div>

                    <div className="text-[14px] w-fit cursor-pointer text-blue-400 mx-auto mb-[160px] hover:text-blue-600">
                        <Link className="w-fit" to={""}>
                            {"Edit profile"}
                        </Link>
                    </div>

                    <div
                        className=" bg-gradient-to-r relative from-cyan-300 z-[100] button_shadow shadow-blue-500 to-blue-500 group hover:cursor-pointer select-none w-[156px] rounded-[12px] h-[42px] py-[6px] text-[20px]
             text-black font-bold mx-auto hover:shadow-none duration-200"
                    >
                        <Link to={"/messenger"} className="outline-none">
                            Messenger
                            <div
                                className="w-[152px] h-[38px] p-[4px] absolute top-1/2 -translate-y-1/2 left-1/2 z-[120] group-hover:bg-transparent duration-100
                 -translate-x-1/2 rounded-[10px] bg-black text-[20px] text-blue-500 group-hover:text-transparent"
                            >
                                <span
                                    className="text-transparent group-hover:text-black duration-100 group-hover:bg-black bg-clip-text bg-gradient-to-r
                     from-cyan-400 to-blue-400"
                                >
                                    Messenger
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="text-[14px] text-blue-400 absolute left-1/2 -translate-x-1/2 bottom-[120px]">
                        {connectionStatus === "connected" ? "Connected" : "Reconnecting..."}
                    </div>
                    <div className="flex flex-row absolute w-fit left-1/2 -translate-x-1/2 bottom-[80px]">
                        <div className="px-1 py-1 duration-200 min-w-[70px]  text-[14px] text-blue-400 hover:text-blue-600 cursor-pointer">
                            Log in
                        </div>
                        <div className="px-1 py-1 duration-200 min-w-[70px]  text-[14px] text-blue-400  hover:text-blue-600 cursor-pointer">
                            Sign up
                        </div>

                        <div className="px-1 py-1 duration-200 min-w-[70px]  text-[14px] text-red-400  hover:text-red-600 cursor-pointer">
                            Log out
                        </div>
                    </div>

                    <div className="text-[14px] absolute left-1/2 -translate-x-1/2 bottom-[20px] text-zinc-600">
                        Created by{" "}
                        <a
                            className="text-zinc-600 underline hover:text-blue-600"
                            href="http://linktr.ee/manighazaee"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Mani
                        </a>
                        .
                    </div>
                </div>
            ) : verified ? (
                <div className="text-center">
                    <div
                        id="logo-cont"
                        className="inline-block relative text-[34px] font-bold mx-auto mt-[12px] mb-[220px]"
                    >
                        Messenger
                    </div>
                    <div className=" bg-gradient-to-r relative from-cyan-300 z-[90] to-blue-500 mb-[20px] group hover:cursor-pointer select-none w-[156px] rounded-[12px] h-[42px] py-[6px] text-[20px] text-black font-bold mx-auto hover:shadow-none duration-200">
                        <Link to={"/signup"} className="outline-none">
                            Sign up
                            <div className="w-[152px] h-[38px] p-[4px] absolute top-1/2 -translate-y-1/2 left-1/2 z-[120] group-hover:bg-transparent duration-100 -translate-x-1/2 rounded-[10px] bg-black text-[20px] text-blue-500 group-hover:text-transparent">
                                <span className="text-transparent group-hover:text-black duration-100 group-hover:bg-black bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                    Sign up
                                </span>
                            </div>
                        </Link>
                    </div>
                    <div className="button_shadow"></div>
                    <div className=" bg-gradient-to-r relative from-cyan-300 z-[90] to-blue-500 group hover:cursor-pointer select-none w-[156px] rounded-[12px] h-[42px] py-[6px] text-[20px] text-black font-bold mx-auto hover:shadow-none duration-200">
                        <Link to={"/Login"} className="outline-none">
                            Log in
                            <div className="w-[152px] h-[38px] p-[4px] absolute top-1/2 -translate-y-1/2 left-1/2 z-[120] group-hover:bg-transparent duration-100 -translate-x-1/2 rounded-[10px] bg-black text-[20px] text-blue-500 group-hover:text-transparent">
                                <span className="text-transparent group-hover:text-black z-[120] duration-100 group-hover:bg-black bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                                    Log in
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Loading color="white" />
                </div>
            )}
        </>
    );
};

export default LandingPage;
