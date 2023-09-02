import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const Chat = ({ selfUsername, chat }: { selfUsername: string | null; chat: Message[] }) => {
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    console.log(chat);

    const chatMessagesRef = useRef<HTMLDivElement>(null);
    const [seenMessages, setSeenMessages] = useState<number[]>([]);

    const handleToggleAutoScroll = () => {
        setAutoScroll(!autoScroll);
    };

    useEffect(() => {
        if (autoScroll && chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chat, autoScroll]);

    const [ref, inView] = useInView();

    return (
        <>
            <div className="text-[14px]" ref={chatMessagesRef}>
                {chat.map((message, index) =>
                    message.sender === selfUsername ? (
                        <div className={`flex flex-row justify-end w-[calc(100%-10px)] ml-[5px] text-right`}>
                            <div
                                key={index}
                                className={`message relative w-fit px-3 bg-gray-600 rounded-2xl py-1 my-[2px] max-w-[70%] `}
                            >
                                {message.content}
                                {
                                    <span className="inline-block text-right ml-[8px] text-[10px] w-fit">{`${new Date(
                                        message.time
                                    )
                                        .getHours()
                                        .toString()
                                        .padStart(2, "0")}:${new Date(message.time)
                                        .getMinutes()
                                        .toString()
                                        .padStart(2, "0")}`}</span>
                                }
                                {message.seen ? (
                                    <span className="ml-[0px] inline-block w-[12px] text-right">
                                        <i className="bi bi-check2-all absolute bottom-[3px] right-[8px]"></i>
                                    </span>
                                ) : (
                                    <span className="ml-[0px] inline-block w-[12px] text-right">
                                        <i className="bi bi-check2 absolute bottom-[3px] right-[8px]"></i>
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-row justify-start w-[calc(100%-10px)] ml-[5px]">
                            <div
                                key={index}
                                className={`message relative w-fit px-3 bg-black rounded-2xl py-1 `}
                            >
                                {message.content}
                            </div>
                        </div>
                    )
                )}
            </div>
            <button onClick={handleToggleAutoScroll}>
                {autoScroll ? "Disable AutoScroll" : "Enable AutoScroll"}
            </button>
        </>
    );
};

export default Chat;
