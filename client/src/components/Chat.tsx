import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import ChatMessage from "./ChatMessage";
import { Socket } from "socket.io-client";
import { TChat } from "../pages/MessengerPage";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const Chat = ({
    token,
    socket,
    selfUsername,
    chat,
    setChat,
    onSeenFn,
    newMessagesMarker,
    setNewMessagesMarker,
    reply,
    setReply,
}: {
    token: string | null;
    socket: Socket;
    selfUsername: string | null;
    chat: Message[];
    setChat: Dispatch<SetStateAction<TChat>>;
    onSeenFn: (index: number, message: Message) => void;
    newMessagesMarker: number | null;
    setNewMessagesMarker: Dispatch<SetStateAction<number | null>>;
    reply: MessageReply | null;
    setReply: Dispatch<SetStateAction<MessageReply | null>>;
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
    }, [messagesRef.current, newMessagesMarker, readyForSeen]);

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
        if (!token) return;
        const userInChat = chat[index].sender === selfUsername ? message.receiver : message.sender;

        socket.emit("deleteMessage", { token, message });

        setChat((prev) => {
            let obj = { ...prev };

            if (obj[userInChat][index]) {
                delete obj[userInChat][index];
            }

            return obj;
        });
    };

    const replyOnClick = (index: number, message: Message) => {
        setReply({
            index: index,
            sender: message.sender,
            receiver: message.receiver,
            content: message.content,
            time: message.time,
        });
        const messageInput = document.getElementById("message-input");
        if (messageInput) {
            messageInput.focus();
        }
    };

    return (
        <>
            <div id="chat-cont" className="text-[14px]" ref={chatContRef}>
                <div
                    className={`${
                        autoScrollInView
                            ? reply !== null
                                ? "bottom-[45px] opacity-0"
                                : "bottom-[5px] opacity-0"
                            : reply !== null
                            ? "bottom-[100px] opacity-100"
                            : "bottom-[60px] opacity-100"
                    } text-white duration-300 text-[50px] rounded-full border border-zinc-800 bg-zinc-900 w-[50px] h-[50px] fixed right-[5px] z-[100] cursor-pointer`}
                    onClick={scrollToBottomOnClick}
                >
                    <ArrowDownwardIcon
                        className=" text-blue-500"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontSize: "30px",
                        }}
                    />
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
                                    setNewMessagesMarker={setNewMessagesMarker}
                                    deleteMessageOnClick={deleteMessageOnClick}
                                    replyOnClick={replyOnClick}
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
                                    setNewMessagesMarker={setNewMessagesMarker}
                                    deleteMessageOnClick={deleteMessageOnClick}
                                    replyOnClick={replyOnClick}
                                />
                            )
                        )}
                </div>

                <p ref={autoScrollRef} id="auto-scroll" className="w-full z-[-10] absolute bottom-0 h-[10px]"></p>
                <div
                    style={{
                        width: "100%",
                        height: reply !== null ? "40px" : "0px",
                    }}
                    className="duration-200"
                ></div>
            </div>
        </>
    );
};

export default Chat;
