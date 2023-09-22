import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { hoursAndMinutes } from "../ts/utils";
import MessageOptions from "./MessageOptions";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ShortcutRoundedIcon from "@mui/icons-material/ShortcutRounded";

const ChatMessage = memo(
    ({
        message,
        type,
        chatIndex,
        onSeenFn,
        selfUsername,
        deleteMessageOnClick,
        replyOnClick,
        scrollToReplyTarget,
        contextOnClick,
    }: {
        message: Message;
        type: "sender" | "receiver";
        chatIndex: number;
        onSeenFn: (index: number, message: Message) => void;
        selfUsername: string;
        deleteMessageOnClick: (...args: any[]) => void;
        replyOnClick: (...args: any[]) => void;
        scrollToReplyTarget: (index: number) => void;
        contextOnClick: (ev: React.MouseEvent<HTMLDivElement>) => { x: number; y: number };
    }) => {
        const [messageMoreOptionsDisplay, setMessageMoreOptionsDisplay] = useState<boolean>(false);
        const [clickPoint, setClickPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

        const { ref, inView } = useInView({
            threshold: 0,
        });

        const memoizedDoubleTickIcon = useMemo(
            () => <i className="bi bi-check2-all absolute bottom-[3px] right-[8px]"></i>,
            []
        );

        const memoizedClockIcon = useMemo(
            () => <i className="bi bi-clock absolute text-[11px] bottom-[4px] right-[8px]"></i>,
            []
        );

        const memoizedOneTickIcon = useMemo(
            () => <i className="bi bi-check2 absolute bottom-[3px] right-[8px]"></i>,
            []
        );

        const memoizedReplyIcon = useMemo(
            () => (
                <ReplyRoundedIcon
                    className=""
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "21px",
                    }}
                />
            ),
            []
        );

        useEffect(() => {
            if (inView && selfUsername === message.receiver && !message.seen) {
                onSeenFn(chatIndex, message);
            }
        }, [inView, onSeenFn]);

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

        const messageOnClick = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
            const chatCont = document.getElementById("chat-scrollable");
            if (!chatCont) return;

            const { x, y } = contextOnClick(ev);
            setMessageMoreOptionsDisplay((prev) => {
                prev = true;
                return prev;
            });
            setClickPoint((prev) => {
                prev = { x, y };
                return prev;
            });
        }, []);

        return (
            <>
                {type === "sender" ? (
                    <>
                        <MessageOptions
                            display={messageMoreOptionsDisplay}
                            displayFn={setMessageMoreOptionsDisplay}
                            clickPoint={clickPoint}
                            items={memoizedItems}
                        />
                        <div
                            id={message.index.toString()}
                            // key={message.receiver + message.index.toString()}
                            className={`flex flex-row justify-end w-[calc(100%-10px)] ml-[5px] text-right rounded-2xl relative group`}
                            ref={ref}
                            onClick={messageOnClick}
                        >
                            <div
                                className={`message relative w-fit px-3 ${
                                    messageMoreOptionsDisplay ? "bg-blue-400" : "bg-blue-700"
                                }  rounded-2xl py-1 my-[2px] break-words background_color_duration_300`}
                            >
                                <div
                                    className="group-hover:opacity-100 opacity-0 duration-150 hover:bg-opacity-100 w-[30px] hidden sm:block rounded-full aspect-square bg-zinc-800 hover:text-blue-500 text-zinc-500 bg-opacity-60 border border-zinc-800 absolute left-[-34px] bottom-[0px] hover:cursor-pointer"
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        replyOnClick(message.index, message);
                                    }}
                                >
                                    {memoizedReplyIcon}
                                </div>

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
                                        {memoizedDoubleTickIcon}
                                    </span>
                                ) : !message.seen && message.status === "WAITING" ? (
                                    <span className="ml-[0px] inline-block w-[12px] text-right">
                                        {memoizedClockIcon}
                                    </span>
                                ) : (
                                    <span className="ml-[0px] inline-block w-[12px] text-right">
                                        {memoizedOneTickIcon}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
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
                            // key={message.sender + message.index.toString()}
                            className={`flex flex-row justify-start w-[calc(100%-10px)] ml-[5px] rounded-2xl group relative`}
                            ref={ref}
                            onClick={messageOnClick}
                        >
                            <div
                                className={`message relative w-fit px-3 ${
                                    messageMoreOptionsDisplay ? "bg-zinc-800" : "bg-zinc-900"
                                }  border border-zinc-800 rounded-2xl py-1 my-[2px] break-words background_color_duration_300`}
                            >
                                <div
                                    className="group-hover:opacity-100 opacity-0 duration-150 hover:bg-opacity-100 w-[30px] hidden sm:block rounded-full aspect-square bg-zinc-800 hover:text-blue-500 text-zinc-500 bg-opacity-60 border border-zinc-800 absolute right-[-34px] bottom-[0px] hover:cursor-pointer"
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        replyOnClick(message.index, message);
                                    }}
                                >
                                    {memoizedReplyIcon}
                                </div>
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
    }
);

export default ChatMessage;
