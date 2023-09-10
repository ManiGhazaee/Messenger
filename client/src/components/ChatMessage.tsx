import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const ChatMessage = ({
    message,
    type,
    chatIndex,
    onSeenFn,
    selfUsername,
    readyForSeen,
    newMessagesMarker,
    setNewMessagesMarker,
}: {
    message: Message;
    type: "sender" | "receiver";
    chatIndex: number;
    onSeenFn: (index: number, message: Message) => void;
    selfUsername: string;
    readyForSeen: boolean;
    newMessagesMarker: number | null;
    setNewMessagesMarker: Dispatch<SetStateAction<number | null>>;
}) => {
    const [newMessagesMarkerDisplay, setNewMessagesMarkerDisplay] = useState<boolean>(true);

    const { ref, inView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (inView && selfUsername === message.receiver && readyForSeen) {
            onSeenFn(chatIndex, message);
            console.log(message.content, "seen");
        }
    }, [inView, onSeenFn, readyForSeen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setNewMessagesMarkerDisplay(false);
            setTimeout(() => {
                setNewMessagesMarker(null);
            }, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {type === "sender" ? (
                <>
                    {newMessagesMarker !== null && newMessagesMarker === message.index && (
                        <div
                            style={{
                                height: newMessagesMarkerDisplay ? "24px" : "0px",
                            }}
                            className={` w-full duration-300 bg-cyan-400 text-black text-center`}
                        >
                            New Messages
                        </div>
                    )}
                    <div id={message.index.toString()} className={`flex flex-row justify-end w-[calc(100%-10px)] ml-[5px] text-right`} ref={ref}>
                        <div className={`message relative w-fit px-3 bg-gray-600 rounded-2xl py-1 my-[2px] break-words`}>
                            {message.content}
                            {
                                <span className="message-time inline-block text-right ml-[8px] text-[10px] w-fit">{`${new Date(message.time)
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}:${new Date(message.time).getMinutes().toString().padStart(2, "0")}`}</span>
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
                </>
            ) : (
                <>
                    {newMessagesMarker !== null && newMessagesMarker === message.index && (
                        <div
                            style={{
                                opacity: newMessagesMarkerDisplay ? "1" : "0",
                                height: newMessagesMarkerDisplay ? "24px" : "0px",
                            }}
                            className="w-full duration-300 bg-cyan-400 text-black text-center"
                        >
                            New Messages
                        </div>
                    )}
                    <div id={message.index.toString()} className={`flex flex-row justify-start w-[calc(100%-10px)] ml-[5px]`} ref={ref}>
                        <div className={`message relative w-fit px-3 bg-black rounded-2xl py-1 my-[2px] break-words`}>
                            {message.content}
                            {
                                <span className=" message-time inline-block text-right ml-[8px] text-[10px] w-fit">{`${new Date(message.time)
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}:${new Date(message.time).getMinutes().toString().padStart(2, "0")}`}</span>
                            }
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ChatMessage;
