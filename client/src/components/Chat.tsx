import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import ChatMessage from "./ChatMessage";
import { Socket } from "socket.io-client";

const Chat = ({
    socket,
    selfUsername,
    chat,
    onSeenFn,
    newMessagesMarker,
}: {
    socket: Socket;
    selfUsername: string | null;
    chat: Message[];
    onSeenFn: (index: number, message: Message) => void;
    newMessagesMarker: number | null;
}) => {
    const chatContRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const [readyForSeen, setReadyForSeen] = useState<boolean>(false);

    if (newMessagesMarker === null && !readyForSeen) {
        setReadyForSeen(() => true);
    }

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

    useEffect(() => {
        const chatScrollable = document.getElementById("chat-scrollable");
        if (messagesRef.current && newMessagesMarker !== null && !readyForSeen && chatScrollable) {
            const children = messagesRef.current.children;
            if (children.length > 0) {
                for (let i = 0; i < children.length; i++) {
                    if (parseInt(children[i].id) === newMessagesMarker) {
                        chatScrollable.scrollTo({
                            top: (children[i] as HTMLElement).offsetTop - 200,
                        });
                        setReadyForSeen(() => true);
                    }
                }
            }
        }
    }, [messagesRef.current]);

    return (
        <>
            <div id="chat-cont" className="text-[14px]" ref={chatContRef}>
                <div className="bg-white text-black w-fit h-fit absolute top-0 left-0">
                    {autoScrollInView.toString()}
                </div>

                <div ref={messagesRef}>
                    {selfUsername &&
                        chat.map((message, index) =>
                            message.sender === selfUsername ? (
                                <ChatMessage
                                    message={message}
                                    type="sender"
                                    onSeenFn={onSeenFn}
                                    chatIndex={index}
                                    selfUsername={selfUsername}
                                    readyForSeen={readyForSeen}
                                    newMessagesMarker={newMessagesMarker}
                                />
                            ) : (
                                <ChatMessage
                                    message={message}
                                    type="receiver"
                                    onSeenFn={onSeenFn}
                                    chatIndex={index}
                                    selfUsername={selfUsername}
                                    readyForSeen={readyForSeen}
                                    newMessagesMarker={newMessagesMarker}
                                />
                            )
                        )}
                </div>

                <p
                    ref={autoScrollRef}
                    id="auto-scroll"
                    className="w-full absolute bottom-0 h-[140px]"
                ></p>
            </div>
        </>
    );
};

export default Chat;
