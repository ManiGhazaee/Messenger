import React, { Dispatch, SetStateAction } from "react";

const Nav = ({
    state,
    moreOnClick,
    chatUsername,
    searchState,
    setSearchState,
    chatMoreOnClick,
}: {
    moreOnClick: (...args: any[]) => void;
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
                onClick={moreOnClick}
                className="flex flex-col relative text-[22px] cursor-pointer"
            >
                {state === "chat" ? (
                    <i className="bi bi-chevron-left"></i>
                ) : (
                    <i className="bi bi-list"></i>
                )}
            </div>
            <div className="text-[18px] font-bold ml-4 mt-[2px] flex flex-row">
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
                    className="absolute right-[31px] top-[31px] cursor-pointer"
                >
                    {searchState ? (
                        <i className="bi bi-x-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                    ) : (
                        <i className="bi bi-search absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                    )}
                </div>
            )}
            {state === "chat" && (
                <div
                    onClick={() => chatMoreOnClick()}
                    className="absolute right-[31px] top-[31px] cursor-pointer"
                >
                    <i className="bi bi-three-dots-vertical absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                </div>
            )}
        </div>
    );
};

export default Nav;
