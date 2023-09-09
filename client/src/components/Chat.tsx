import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import ChatMessage from "./ChatMessage";
import { Socket } from "socket.io-client";
import ContextMenu from "./ContextMenu";
import { TChat } from "../pages/MessengerPage";
import ReactDOM, { createPortal } from "react-dom";
import ConfirmModal from "./ConfirmModal";

const Chat = ({
    token,
    id,
    socket,
    selfUsername,
    chat,
    setChat,
    onSeenFn,
    newMessagesMarker,
}: {
    token: string | null;
    id: string | null;
    socket: Socket;
    selfUsername: string | null;
    chat: Message[];
    setChat: Dispatch<SetStateAction<TChat>>;
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

    const scrollToBottomOnClick = () => {
        const chatScrollable = document.getElementById("chat-scrollable");
        if (chatScrollable) {
            chatScrollable.scrollTo({
                top: chatScrollable.offsetHeight,
                behavior: "smooth",
            });
        }
    };

    const deleteMessageOnClick = (index: number, message: Message) => {
        if (!token || !id) return;
        const isSelfSender = chat[index].sender === selfUsername;

        socket.emit("deleteMessage", { token, id, message });
        setChat((prev) => {
            let obj = { ...prev };
            if (isSelfSender) {
                if (obj[message.receiver][index]) {
                    delete obj[message.receiver][index];
                }
            } else {
                if (obj[message.sender][index]) {
                    delete obj[message.sender][index];
                }
            }
            return obj;
        });
    };

    return (
        <>
            <div id="chat-cont" className="text-[14px]" ref={chatContRef}>
                {
                    <div
                        className={`${
                            autoScrollInView ? "bottom-[40px] opacity-0" : "bottom-[50px] opacity-100"
                        } text-white duration-300 text-[40px] w-fit h-fit fixed right-[5px] z-[100] cursor-pointer`}
                        onClick={scrollToBottomOnClick}
                    >
                        <i className="bi bi-arrow-down-circle-fill"></i>
                    </div>
                }

                <div ref={messagesRef}>
                    {selfUsername &&
                        chat.map((message, index) =>
                            message.sender === selfUsername ? (
                                <ContextMenu
                                    items={[
                                        { text: "Replay", onClick: () => {} },
                                        {
                                            text: "Copy",
                                            onClick: (index) => {
                                                console.log(chat[index]);
                                            },
                                            params: [index],
                                        },
                                        { text: "Forward", onClick: () => {} },
                                        {
                                            text: "Delete",
                                            onClick: deleteMessageOnClick,
                                            params: [index, message],
                                            style: { color: "red" },
                                        },
                                    ]}
                                >
                                    <ChatMessage
                                        message={message}
                                        type="sender"
                                        onSeenFn={onSeenFn}
                                        chatIndex={index}
                                        selfUsername={selfUsername}
                                        readyForSeen={readyForSeen}
                                        newMessagesMarker={newMessagesMarker}
                                    />
                                </ContextMenu>
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

                <p ref={autoScrollRef} id="auto-scroll" className="w-full z-[-10] absolute bottom-0 h-[40px]"></p>
            </div>
        </>
    );
};

export default Chat;
