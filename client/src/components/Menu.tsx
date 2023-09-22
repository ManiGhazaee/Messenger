import React, { Dispatch, SetStateAction, memo, useCallback } from "react";
import Loading from "./Loading";
import { hoursAndMinutes } from "../ts/utils";
import { TChat } from "../pages/MessengerPage";
import MenuItem from "./MenuItem";

const Menu = memo(
    ({
        menu,
        state,
        userOnClick,
        chatUsername,
        onlineUsers,
        chat,
        typers,
        setClearHistoryConfirmModal,
        setDeleteChatConfirmModal,
    }: {
        menu: User | null;
        state: "chat" | "menu";
        userOnClick: (username: string) => void;
        chatUsername: string | null;
        onlineUsers: Record<string, boolean>;
        chat: TChat;
        typers: string[];
        setClearHistoryConfirmModal: Dispatch<SetStateAction<boolean>>;
        setDeleteChatConfirmModal: Dispatch<SetStateAction<boolean>>;
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

        const menuContextOnClick = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
            const chatCont = document.getElementById("menu")!;
            const rect = chatCont.getBoundingClientRect();

            const chatWidth = chatCont.offsetWidth;
            const chatHeight = chatCont.offsetHeight;

            const chatOffsetTop = rect.top + window.scrollY;
            const chatOffsetLeft = rect.left + window.scrollX;

            let x = ev.clientX;
            let y = ev.clientY;

            if (ev.clientX > chatWidth / 2 + chatOffsetLeft) {
                x = ev.clientX - 180;
            }
            if (ev.clientY > chatHeight / 2 + chatOffsetTop) {
                y = ev.clientY - 2 * 38 - 8;
            }
            return { x, y };
        }, []);

        return (
            <div
                id="menu"
                className={`${
                    state === "menu" ? "w-full" : "w-0"
                } relative sm:w-[400px] bg-zinc-900 md:border-r md:border-r-zinc-800 h-full duration-200 overflow-y-scroll sm:rounded-xl sm:border sm:border-zinc-800 sm:py-[4px] sm:pl-[4px] sm:pr-[2px] sm:top-[4px] sm:h-[calc(100%-8px)]`}
            >
                {menu && "rooms" in menu && menu.rooms.length !== 0 ? (
                    menu.rooms.map((elem, index) => {
                        return (
                            <MenuItem
                                index={index}
                                chatUsername={chatUsername}
                                userOnClick={userOnClick}
                                elem={elem}
                                onlineUsers={onlineUsers}
                                typers={typers}
                                lastMessageOfUsers={lastMessageOfUsers}
                                notSeenCountOfUsers={notSeenCountOfUsers}
                                menuContextOnClick={menuContextOnClick}
                                setClearHistoryConfirmModal={setClearHistoryConfirmModal}
                                setDeleteChatConfirmModal={setDeleteChatConfirmModal}
                            />
                        );
                    })
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
