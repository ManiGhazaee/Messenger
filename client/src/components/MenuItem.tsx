import React, { Dispatch, SetStateAction, memo, useCallback, useMemo, useState } from "react";
import { hoursAndMinutes } from "../ts/utils";
import MenuItemOptions from "./MenuItemOptions";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const MenuItem = memo(
    ({
        index,
        chatUsername,
        userOnClick,
        elem,
        onlineUsers,
        typers,
        lastMessageOfUsers,
        notSeenCountOfUsers,
        menuContextOnClick,
        setClearHistoryConfirmModal,
        setDeleteChatConfirmModal,
    }: {
        index: number;
        chatUsername: string | null;
        userOnClick: (username: string) => void;
        elem: UserRoom;
        onlineUsers: Record<string, boolean>;
        typers: string[];
        lastMessageOfUsers: Message[];
        notSeenCountOfUsers: number[];
        menuContextOnClick: (...args: any[]) => { x: number; y: number };
        setClearHistoryConfirmModal: Dispatch<SetStateAction<boolean>>;
        setDeleteChatConfirmModal: Dispatch<SetStateAction<boolean>>;
    }) => {
        const [menuItemOptionsDisplay, setMenuItemOptionsDisplay] = useState<boolean>(false);
        const [clickPoint, setClickPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

        const menuItemOnClick = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
            if (ev.type !== "contextmenu") return;

            ev.preventDefault();
            ev.stopPropagation();

            const chatCont = document.getElementById("menu");
            if (!chatCont) return;

            const { x, y } = menuContextOnClick(ev);
            setMenuItemOptionsDisplay((prev) => {
                prev = true;
                return prev;
            });
            setClickPoint((prev) => {
                prev = { x, y };
                return prev;
            });
        }, []);

        const memoizedItems = useMemo(
            () => [
                {
                    text: "Clear History",
                    onClick: () => {
                        setClearHistoryConfirmModal(true);
                    },
                    icon: <RestoreRoundedIcon style={{ marginRight: "10px", top: "-1px", position: "relative" }} />,
                },
                {
                    text: "Delete Chat",
                    onClick: () => {
                        setDeleteChatConfirmModal(true);
                    },
                    style: { color: "red" },

                    icon: (
                        <DeleteOutlineRoundedIcon style={{ marginRight: "10px", top: "-1px", position: "relative" }} />
                    ),
                },
            ],
            []
        );

        return (
            <>
                <MenuItemOptions
                    display={menuItemOptionsDisplay}
                    displayFn={setMenuItemOptionsDisplay}
                    clickPoint={clickPoint}
                    items={memoizedItems}
                />
                <div
                    className="scale_opacity_anim_300 h-[60px] flex flex-row w-[100%] hover:bg-zinc-400 border-borders group cursor-pointer duration-200 overflow-hidden rounded-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => userOnClick(elem.username)}
                    onContextMenu={menuItemOnClick}
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
                                scale: elem.username in onlineUsers && onlineUsers[elem.username] ? "1" : "0",
                            }}
                            className="w-[14px] aspect-square bg-blue-500 rounded-full absolute bottom-0 right-0 border-[2px] border-zinc-900 group-hover:border-zinc-400 group-hover:bg-black duration-200"
                        ></div>
                    </div>
                    <div className="flex flex-col relative w-full">
                        <div className="text-[18px] mt-[6px] ml-[10px] font-semibold group-hover:text-black duration-200">
                            {elem.username}
                        </div>
                        <div className="relative">
                            <div
                                style={{
                                    opacity: typers.includes(elem.username) ? "0" : "1",
                                }}
                                className="relative text-[14px] text-zinc-500 mt-[0px] ml-[10px] max-w-[50%] overflow-hidden group-hover:text-black menu_message_transition"
                            >
                                {lastMessageOfUsers[index].content.length > 25
                                    ? lastMessageOfUsers[index].content.slice(0, 25) + "..."
                                    : lastMessageOfUsers[index].content}
                            </div>
                            <div
                                style={{
                                    opacity: typers.includes(elem.username) ? "1" : "0",
                                }}
                                className="absolute h-fit delay-300 bg-zinc-900 top-0 left-0 text-[14px] group-hover:bg-zinc-400 duration-200 group-hover:text-black w-[55%] pl-[8px] text-blue-400"
                            >
                                Typing
                                <span className="animate-pulse ">.</span>
                                <span className="animate-pulse anim_delay_200">.</span>
                                <span className="animate-pulse anim_delay_400">.</span>
                            </div>
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
            </>
        );
    }
);

export default MenuItem;
