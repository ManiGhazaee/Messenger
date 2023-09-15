import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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
    readyForSeen,
    newMessagesMarker,
    setNewMessagesMarker,
    deleteMessageOnClick,
    replyOnClick,
}: {
    message: Message;
    type: "sender" | "receiver";
    chatIndex: number;
    onSeenFn: (index: number, message: Message) => void;
    selfUsername: string;
    readyForSeen: boolean;
    newMessagesMarker: number | null;
    setNewMessagesMarker: Dispatch<SetStateAction<number | null>>;
    deleteMessageOnClick: (...args: any[]) => void;
    replyOnClick: (...args: any[]) => void;
}) => {
    const [newMessagesMarkerDisplay, setNewMessagesMarkerDisplay] = useState<boolean>(true);
    const [messageMoreOptionsDisplay, setMessageMoreOptionsDisplay] = useState<boolean>(false);
    const [clickPoint, setClickPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const { ref, inView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (inView && selfUsername === message.receiver && readyForSeen) {
            onSeenFn(chatIndex, message);
        }
    }, [inView, onSeenFn, readyForSeen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setNewMessagesMarkerDisplay(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const contextOnClick = (ev: React.MouseEvent<HTMLDivElement>) => {
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
    };

    const scrollToReplyTarget = (index: number) => {
        const replyTarget = document.getElementById(index.toString());
        const chatCont = document.getElementById("chat-scrollable");

        replyTarget?.classList.add("bg-zinc-900");

        setTimeout(() => {
            replyTarget?.classList.remove("bg-zinc-900");
        }, 3000);

        if (replyTarget && chatCont) {
            replyTarget.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
            });
        }
    };

    return (
        <>
            {type === "sender" ? (
                <div className="relative">
                    <MessageOptions
                        display={messageMoreOptionsDisplay}
                        displayFn={setMessageMoreOptionsDisplay}
                        clickPoint={clickPoint}
                        items={[
                            {
                                text: "Replay",
                                onClick: replyOnClick,
                                params: [chatIndex, message],
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
                        ]}
                    />
                    <div
                        id={message.index.toString()}
                        key={message.receiver + message.index.toString()}
                        className={`flex flex-row justify-end w-[calc(100%-10px)] ml-[5px] text-right`}
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
                                    className="py-1 pr-3 relative w-[calc(100%+16px)] left-[-8px] duration-0 z-[180] pl-0 rounded-xl flex flex-row text-left hover:bg-blue-800 cursor-pointer "
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        scrollToReplyTarget(message.reply?.index || Infinity);
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
                    {newMessagesMarker !== null && newMessagesMarker === message.index && (
                        <div
                            className={` ${
                                newMessagesMarkerDisplay ? "unread_open" : "unread_close"
                            } w-full duration-300 bg-zinc-900 my-[4px] text-zinc-500 text-center overflow-hidden`}
                        >
                            Unread messages
                        </div>
                    )}
                    <MessageOptions
                        display={messageMoreOptionsDisplay}
                        displayFn={setMessageMoreOptionsDisplay}
                        clickPoint={clickPoint}
                        items={[
                            {
                                text: "Replay",
                                onClick: replyOnClick,
                                params: [chatIndex, message],
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
                        ]}
                    />
                    <div
                        id={message.index.toString()}
                        key={message.sender + message.index.toString()}
                        className={`flex flex-row justify-start w-[calc(100%-10px)] ml-[5px]`}
                        ref={ref}
                        onClick={(ev) => contextOnClick(ev)}
                    >
                        <div
                            className={`message relative w-fit px-3 ${
                                messageMoreOptionsDisplay ? "bg-zinc-800" : "bg-zinc-900"
                            }  border border-zinc-800 rounded-2xl py-1 my-[2px] break-words background_color_duration_300`}
                        >
                            {message.reply && (
                                <div className="py-1 px-3">
                                    <div className=""></div>
                                    <div>
                                        {message.reply.content.length > 30
                                            ? message.reply.content.slice(0, 30)
                                            : message.reply.content}
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
