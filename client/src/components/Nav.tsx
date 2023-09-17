import React, { Dispatch, SetStateAction, memo } from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ChatState } from "./MessageOptions";

const Nav = memo(
    ({
        state,
        moreOnClick,
        chatUsername,
        searchState,
        setSearchState,
        chatMoreOnClick,
    }: {
        moreOnClick: (state: ChatState) => void;
        state: "chat" | "menu";
        chatUsername: string | null;
        searchState: boolean;
        setSearchState: Dispatch<SetStateAction<boolean>>;
        chatMoreOnClick: (...args: any[]) => void;
    }) => {
        return (
            <div
                id="nav"
                className="flex flex-row w-full py-[14px] px-[18px] border-b-[1px] border-zinc-800 borders relative"
            >
                <div
                    onClick={() => moreOnClick(state)}
                    className="flex flex-col relative text-[22px] text-zinc-600 cursor-pointer"
                >
                    {state === "chat" ? <ArrowBackIosNewRoundedIcon /> : <MenuRoundedIcon />}
                </div>
                <div className="text-[18px] font-bold ml-4 flex flex-row">
                    {chatUsername ? (
                        <div className="md:hidden h-[33px] mt-[-2px] mr-[18px] aspect-square rounded-full bg-zinc-800"></div>
                    ) : (
                        <></>
                    )}
                    {chatUsername ? chatUsername : "Messenger"}
                </div>
                {state === "menu" && (
                    <div
                        onClick={() => setSearchState(!searchState)}
                        className="absolute right-[18px] top-1/2 -translate-y-1/2 text-zinc-600 cursor-pointer"
                    >
                        {searchState ? <CloseRoundedIcon /> : <SearchRoundedIcon />}
                    </div>
                )}
                {state === "chat" && (
                    <div
                        onClick={() => chatMoreOnClick(state)}
                        className="absolute right-[18px] top-1/2 -translate-y-1/2 text-zinc-600 cursor-pointer"
                    >
                        <MoreVertRoundedIcon />
                    </div>
                )}
            </div>
        );
    }
);

export default Nav;
