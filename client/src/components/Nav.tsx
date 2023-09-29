import React, { Dispatch, SetStateAction, memo, useMemo } from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ChatState } from "./MessageOptions";
import { ConnectionStatus } from "../App";

const Nav = memo(
    ({
        state,
        moreOnClick,
        chatUsername,
        searchState,
        setSearchState,
        chatMoreOnClick,
        connectionStatus,
        onlineStatus,
    }: {
        moreOnClick: (state: ChatState) => void;
        state: "chat" | "menu";
        chatUsername: string | null;
        searchState: boolean;
        setSearchState: Dispatch<SetStateAction<boolean>>;
        chatMoreOnClick: (...args: any[]) => void;
        connectionStatus: ConnectionStatus;
        onlineStatus: boolean;
    }) => {
        const iconStyle = useMemo(() => ({ width: "27px", height: "27px" }), []);

        let navTitle: string | JSX.Element;

        if (connectionStatus !== "connected") {
            navTitle = (
                <span>
                    Connecting<span className="animate-pulse ">.</span>
                    <span className="animate-pulse anim_delay_200">.</span>
                    <span className="animate-pulse anim_delay_400">.</span>
                </span>
            );
        } else {
            if (chatUsername) {
                navTitle = chatUsername;
            } else {
                navTitle = "Messenger";
            }
        }

        return (
            <div
                id="nav"
                className="flex flex-row w-full py-[14px] px-[18px] h-[60px] border-b-[1px] border-zinc-800 borders relative sm:rounded-b-xl"
            >
                <div
                    onClick={() => moreOnClick(state)}
                    className="flex flex-col relative text-[22px] text-zinc-600 cursor-pointer"
                >
                    {state === "chat" ? (
                        <ArrowBackIosNewRoundedIcon style={iconStyle} />
                    ) : (
                        <MenuRoundedIcon style={iconStyle} />
                    )}
                </div>
                <div className="text-[20px] font-bold ml-4 flex flex-row">
                    {chatUsername ? (
                        <div className="md:hidden h-[33px] mt-[-2px] mr-[18px] aspect-square rounded-full bg-zinc-800 relative">
                            <div
                                style={{
                                    opacity: onlineStatus ? "1" : "0",
                                    scale: onlineStatus ? "1" : "0",
                                }}
                                className="w-[14px] aspect-square bg-blue-500 rounded-full absolute bottom-[-2px] right-[-2px] border-[2px] border-black group-hover:border-zinc-400 group-hover:bg-black duration-200"
                            ></div>
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className="flex flex-col">
                        <div className={`${!chatUsername ? "" : "mt-[-6px] text-[19px]"} duration-200`}>{navTitle}</div>
                        <div
                            className={`${onlineStatus ? "text-blue-500" : "text-zinc-500"} ${
                                !chatUsername ? "opacity-0" : "opacity-100"
                            } text-[14px] font-normal duration-200 mt-[-6px]`}
                        >
                            {onlineStatus ? "Online" : "Offline"}
                        </div>
                    </div>
                </div>
                {state === "menu" && (
                    <div
                        onClick={() => setSearchState(!searchState)}
                        className="absolute right-[18px] top-1/2 -translate-y-1/2 text-zinc-600 cursor-pointer"
                    >
                        {searchState ? <CloseRoundedIcon style={iconStyle} /> : <SearchRoundedIcon style={iconStyle} />}
                    </div>
                )}
                {state === "chat" && (
                    <div
                        onClick={() => chatMoreOnClick(state)}
                        className="absolute right-[18px] top-1/2 -translate-y-1/2 text-zinc-600 cursor-pointer"
                    >
                        <MoreVertRoundedIcon style={iconStyle} />
                    </div>
                )}
            </div>
        );
    }
);

export default Nav;
