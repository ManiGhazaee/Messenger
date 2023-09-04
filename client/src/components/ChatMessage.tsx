import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const ChatMessage = ({
    message,
    type,
    chatIndex,
    onSeenFn,
    selfUsername,
}: {
    message: Message;
    type: "sender" | "receiver";
    chatIndex: number;
    onSeenFn: (index: number, message: Message) => void;
    selfUsername: string;
}) => {
    const { ref, inView, entry } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (inView && selfUsername === message.receiver) {
            onSeenFn(chatIndex, message);
            console.log(message.content, "SEEN");
        }
    }, [inView, onSeenFn]);

    return (
        <>
            {type === "sender" ? (
                <div
                    id={message.index.toString()}
                    className={`flex flex-row justify-end w-[calc(100%-10px)] ml-[5px] text-right`}
                    ref={ref}
                >
                    <div
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
                <>
                    <div
                        id={message.index.toString()}
                        className="flex flex-row justify-start w-[calc(100%-10px)] ml-[5px]"
                        ref={ref}
                    >
                        <div className={`message relative w-fit px-3 bg-black rounded-2xl py-1 my-[2px] max-w-[70%]`}>
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
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ChatMessage;
