import React, { useCallback, useEffect, useRef, useState, WheelEvent } from "react";
import { InView, useInView } from "react-intersection-observer";
import ChatMessage from "./ChatMessage";
import { Socket } from "socket.io-client";

const Chat = ({
    socket,
    selfUsername,
    chat,
    onSeenFn,
}: {
    socket: Socket;
    selfUsername: string | null;
    chat: Message[];
    onSeenFn: (index: number, message: Message) => void;
}) => {
    const chatContRef = useRef<HTMLDivElement>(null);
    const [seenMessages, setSeenMessages] = useState<number[]>([]);

    const [autoScrollRef, autoScrollInView] = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (autoScrollInView) {
            const autoS = document.getElementById("auto-scroll");
            if (autoS) {
                autoS.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [chat]);

    return (
        <>
            <div id="chat-cont" className="text-[14px]" ref={chatContRef}>
                <div className="bg-white text-black w-fit h-fit absolute top-0 left-0">
                    {autoScrollInView.toString()}
                </div>
                {selfUsername && chat.map((message, index) =>
                    message.sender === selfUsername ? (
                        <ChatMessage
                            message={message}
                            type="sender"
                            onSeenFn={onSeenFn}
                            chatIndex={index}
                            selfUsername={selfUsername}
                        />
                    ) : (
                        <ChatMessage
                            message={message}
                            type="receiver"
                            onSeenFn={onSeenFn}
                            chatIndex={index}
                            selfUsername={selfUsername}
                        />
                    )
                )}

                <p
                    ref={autoScrollRef}
                    id="auto-scroll"
                    className="w-full absolute bottom-0 h-[140px]"
                ></p>
            </div>
            {/* <button onClick={handleToggleAutoScroll}>
                {autoScroll ? "Disable AutoScroll" : "Enable AutoScroll"}
            </button> */}
        </>
    );
};

export default Chat;
