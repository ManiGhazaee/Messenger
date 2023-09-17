import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { hoursAndMinutes } from "../ts/utils";
import MessageOptions from "./MessageOptions";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ShortcutRoundedIcon from "@mui/icons-material/ShortcutRounded";

const numberOfChatMoreOptionsItems = 4;

const ChatMessage = ({
    message,
    type,
    chatIndex,
    onSeenFn,
    selfUsername,
    deleteMessageOnClick,
    replyOnClick,
}: {
    message: Message;
    type: "sender" | "receiver";
    chatIndex: number;
    onSeenFn: (index: number, message: Message) => void;
    selfUsername: string;
    deleteMessageOnClick: (...args: any[]) => void;
    replyOnClick: (...args: any[]) => void;
}) => {
    const [messageMoreOptionsDisplay, setMessageMoreOptionsDisplay] = useState<boolean>(false);
    const [clickPoint, setClickPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const { ref, inView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (inView && selfUsername === message.receiver && !message.seen) {
            console.log(message.content, "-------SEEN-------");
            onSeenFn(chatIndex, message);
        }
    }, [inView, onSeenFn]);

    const contextOnClick = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
        const chatCont = document.getElementById("chat-scrollable");
        if (!chatCont) return;
        const chatWidth = chatCont.offsetWidth;
        const chatHeight = chatCont.offsetHeight;

        const rect = chatCont.getBoundingClientRect();

        const chatOffsetTop = rect.top + window.scrollY;
        const chatOffsetLeft = rect.left + window.scrollX;

        let x = ev.clientX;
        let y = ev.clientY;
        if (ev.clientX > chatWidth / 2 + chatOffsetLeft) {
            x = ev.clientX - 180;
        }
        if (ev.clientY > chatHeight / 2 + chatOffsetTop) {
            y = ev.clientY - numberOfChatMoreOptionsItems * 38 - 8;
        }
        setMessageMoreOptionsDisplay((prev) => {
            prev = true;
            return prev;
        });
        setClickPoint((prev) => {
            prev = { x, y };
            return prev;
        });
    }, []);

    const scrollToReplyTarget = useCallback((index: number) => {
        const replyTarget = document.getElementById(index.toString());
        const chatCont = document.getElementById("chat-scrollable");

        replyTarget?.classList.add("bg-zinc-900");

        setTimeout(() => {
            replyTarget?.classList.remove("bg-zinc-900");
        }, 2000);

        if (replyTarget && chatCont) {
            replyTarget.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, []);

    const memoizedItems = useMemo(
        () => [
            {
                text: "Replay",
                onClick: replyOnClick,
                params: [message.index, message],
                icon: (
                    <ReplyRoundedIcon
                        style={{
                            marginRight: "9px",
                            top: "-2px",
                            position: "relative",
                        }}
                    />
                ),
            },
            {
                text: "Copy",
                onClick: (index) => {
                    console.log(chatIndex);
                },
                icon: (
                    <ContentCopyRoundedIcon
                        style={{
                            marginRight: "9px",
                            top: "-2px",
                            position: "relative",
                        }}
                    />
                ),
                params: [chatIndex],
            },
            {
                text: "Forward",
                onClick: () => {},
                icon: (
                    <ShortcutRoundedIcon
                        style={{
                            marginRight: "9px",
                            top: "-2px",
                            position: "relative",
                        }}
                    />
                ),
            },
            {
                text: "Delete",
                onClick: deleteMessageOnClick,
                icon: (
                    <DeleteOutlineRoundedIcon
                        style={{
                            marginRight: "9px",
                            top: "-2px",
                            position: "relative",
                        }}
                    />
                ),
                params: [chatIndex, message],
                style: { color: "red" },
            },
        ],
        []
    );

    return (
        <>
            {type === "sender" ? (
                <div className="relative">
                    <MessageOptions
                        display={messageMoreOptionsDisplay}
                        displayFn={setMessageMoreOptionsDisplay}
                        clickPoint={clickPoint}
                        items={memoizedItems}
                    />
                    <div
                        id={message.index.toString()}
                        key={message.receiver + message.index.toString()}
                        className={`flex flex-row justify-end w-[calc(100%-10px)] ml-[5px] text-right rounded-2xl`}
                        ref={ref}
                        onClick={(ev) => contextOnClick(ev)}
                    >
                        <div
                            className={`message relative w-fit px-3 ${
                                messageMoreOptionsDisplay ? "bg-blue-400" : "bg-blue-700"
                            }  rounded-2xl py-1 my-[2px] break-words background_color_duration_300`}
                        >
                            {message.reply && (
                                <div
                                    className="py-1 pr-3 relative w-[calc(100%+16px)] left-[-8px] pl-0 rounded-xl flex flex-row text-left hover:bg-blue-800 cursor-pointer "
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        if (
                                            message.reply &&
                                            "index" in message.reply &&
                                            typeof message.reply.index === "number"
                                        )
                                            scrollToReplyTarget(message.reply.index);
                                    }}
                                >
                                    <div className="w-[3px] my-[4px] ml-[8px] bg-blue-300 rounded-full mr-2"></div>
                                    <div className="flex flex-col">
                                        <div className="text-blue-300">{message.reply.sender}</div>
                                        <div>
                                            {message.reply.content.length > 30
                                                ? message.reply.content.slice(0, 30) + "..."
                                                : message.reply.content}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {message.content}
                            {
                                <span className="message-time cursor-default inline-block text-right ml-[8px] text-[10px] w-fit">{`${hoursAndMinutes(
                                    message.time
                                )}`}</span>
                            }
                            {message.seen ? (
                                <span className="ml-[0px] inline-block w-[12px] text-right">
                                    <i className="bi bi-check2-all absolute bottom-[3px] right-[8px]"></i>
                                </span>
                            ) : !message.seen && message.status === "WAITING" ? (
                                <span className="ml-[0px] inline-block w-[12px] text-right">
                                    <i className="bi bi-clock absolute text-[11px] bottom-[4px] right-[8px]"></i>
                                </span>
                            ) : (
                                <span className="ml-[0px] inline-block w-[12px] text-right">
                                    <i className="bi bi-check2 absolute bottom-[3px] right-[8px]"></i>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <MessageOptions
                        display={messageMoreOptionsDisplay}
                        displayFn={setMessageMoreOptionsDisplay}
                        clickPoint={clickPoint}
                        items={memoizedItems}
                    />
                    <div
                        id={message.index.toString()}
                        key={message.sender + message.index.toString()}
                        className={`flex flex-row justify-start w-[calc(100%-10px)] ml-[5px] rounded-2xl`}
                        ref={ref}
                        onClick={(ev) => contextOnClick(ev)}
                    >
                        <div
                            className={`message relative w-fit px-3 ${
                                messageMoreOptionsDisplay ? "bg-zinc-800" : "bg-zinc-900"
                            }  border border-zinc-800 rounded-2xl py-1 my-[2px] break-words background_color_duration_300`}
                        >
                            {message.reply && (
                                <div
                                    className="py-1 pr-3 relative w-[calc(100%+16px)] left-[-8px] pl-0 rounded-xl flex flex-row text-left hover:bg-zinc-800 cursor-pointer "
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        if (
                                            message.reply &&
                                            "index" in message.reply &&
                                            typeof message.reply.index === "number"
                                        )
                                            scrollToReplyTarget(message.reply.index);
                                    }}
                                >
                                    <div className="w-[3px] my-[4px] ml-[8px] bg-blue-300 rounded-full mr-2"></div>
                                    <div className="flex flex-col">
                                        <div className="text-blue-300">{message.reply.sender}</div>
                                        <div>
                                            {message.reply.content.length > 30
                                                ? message.reply.content.slice(0, 30) + "..."
                                                : message.reply.content}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {message.content}
                            {
                                <span className="message-time cursor-default inline-block text-right ml-[8px] text-[10px] text-zinc-500 w-fit">{`${hoursAndMinutes(
                                    message.time
                                )}`}</span>
                            }
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ChatMessage;
