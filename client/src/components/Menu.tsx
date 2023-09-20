import React, { memo } from "react";
import Loading from "./Loading";
import { hoursAndMinutes } from "../ts/utils";
import { TChat } from "../pages/MessengerPage";

const Menu = memo(
    ({
        menu,
        state,
        userOnClick,
        chatUsername,
        onlineUsers,
        chat,
    }: {
        menu: User | null;
        state: "chat" | "menu";
        userOnClick: (username: string) => void;
        chatUsername: string | null;
        onlineUsers: Record<string, boolean>;
        chat: TChat;
    }) => {
        let notSeenCountOfUsers: number[] = [];

        if (menu && "rooms" in menu && menu.rooms.length !== 0) {
            for (let i = 0; i < menu.rooms.length; i++) {
                const elemUsername: string = menu.rooms[i].username;

                if (chat && elemUsername in chat && chat[elemUsername].length !== 0) {
                    const chatWithLength = chat[elemUsername].length;
                    let firstSeenIndex = chatWithLength;

                    if (chat[elemUsername][chatWithLength - 1].sender !== elemUsername) {
                        notSeenCountOfUsers[i] = 0;
                        continue;
                    }

                    for (let j = chatWithLength - 1; j >= 0; j--) {
                        if (chat[elemUsername][j]?.seen) {
                            firstSeenIndex = chatWithLength - j - 1;
                            break;
                        }
                    }

                    notSeenCountOfUsers[i] = firstSeenIndex;
                } else {
                    notSeenCountOfUsers[i] = menu.rooms[i].not_seen_count;
                }
            }
        }

        let lastMessageOfUsers: Message[] = [];

        if (menu && "rooms" in menu && menu.rooms.length !== 0) {
            for (let i = 0; i < menu.rooms.length; i++) {
                const elemUsername: string = menu.rooms[i].username;

                if (chat && elemUsername in chat && chat[elemUsername].length !== 0) {
                    lastMessageOfUsers[i] = chat[elemUsername][chat[elemUsername].length - 1];
                } else {
                    lastMessageOfUsers[i] = menu.rooms[i].last_message;
                }
            }
        }

        return (
            <div
                id="menu"
                className={`${
                    state === "menu" ? "w-full" : "w-0"
                } relative sm:w-[400px] bg-zinc-900 md:border-r md:border-r-zinc-800 h-full duration-200 overflow-y-scroll sm:rounded-xl sm:border sm:border-zinc-800 sm:py-[4px] sm:pl-[4px] sm:pr-[2px] sm:top-[4px] sm:h-[calc(100%-8px)]`}
            >
                {menu && "rooms" in menu && menu.rooms.length !== 0 ? (
                    menu.rooms.map((elem, index) => (
                        <div
                            className="scale_opacity_anim_300 h-[60px] flex flex-row w-[100%] hover:bg-zinc-400 border-borders group cursor-pointer duration-200 overflow-hidden rounded-lg"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => userOnClick(elem.username)}
                        >
                            <div
                                style={{
                                    height: elem.username === chatUsername ? "70%" : "0px",
                                    opacity: elem.username === chatUsername ? "1" : "0",
                                }}
                                className="w-[6px] duration-150 bg-blue-500 group-hover:bg-black rounded-full absolute top-1/2 -translate-y-1/2 left-[4px] "
                            ></div>
                            <div className="h-3/4 my-[7px] mr-[7px] ml-[18px] aspect-square rounded-full bg-zinc-800 relative">
                                <div
                                    style={{
                                        opacity: elem.username in onlineUsers && onlineUsers[elem.username] ? "1" : "0",
                                    }}
                                    className="w-[14px] aspect-square bg-blue-500 rounded-full absolute bottom-0 right-0 border-[2px] border-zinc-900 group-hover:border-zinc-400 duration-200"
                                ></div>
                            </div>
                            <div className="flex flex-col relative w-full">
                                <div className="text-[18px] mt-[6px] ml-[10px] font-semibold group-hover:text-black duration-200">
                                    {elem.username}
                                </div>
                                <div className="text-[14px] text-zinc-500 mt-[0px] ml-[10px] max-w-[50%] overflow-hidden group-hover:text-black duration-200">
                                    {lastMessageOfUsers[index].content.length > 25
                                        ? lastMessageOfUsers[index].content.slice(0, 25) + "..."
                                        : lastMessageOfUsers[index].content}
                                </div>

                                <div className="ml-[0px] h-[20px] absolute bottom-[8px] text-zinc-500 group-hover:text-black duration-200 right-[8px] inline-block w-[72px] text-right">
                                    <div className="inline-block text-right mr-[8px] text-[12px] relative top-[-1px] w-fit">
                                        {hoursAndMinutes(lastMessageOfUsers[index].time)}
                                    </div>

                                    {elem.username === lastMessageOfUsers[index].receiver &&
                                        (lastMessageOfUsers[index].seen ? (
                                            <i className="bi bi-check2-all mr-[8px]"></i>
                                        ) : (
                                            <i className="bi bi-check2 mr-[8px]"></i>
                                        ))}
                                </div>

                                {notSeenCountOfUsers[index] > 0 && (
                                    <div className="absolute scale_opacity_anim_300 anim_delay_500 bg-white font-bold rounded-full h-fit px-[2px] py-[3px] group-hover:bg-black group-hover:text-white duration-200 min-w-[23px] text-center text-black text-[12px] right-[14px] top-[8px] ">
                                        {notSeenCountOfUsers[index]}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : menu === null ? (
                    <div
                        key="menu-loading"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale_opacity_anim_300 px-1 py-1 bg-zinc-800 rounded-2xl text-[14px]"
                    >
                        <Loading color="white" />
                    </div>
                ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-zinc-900 rounded-2xl text-[14px]">
                        {"No users found"}
                    </div>
                )}
            </div>
        );
    }
);

export default Menu;
