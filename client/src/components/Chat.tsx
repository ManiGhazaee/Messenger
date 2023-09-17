import React, { Dispatch, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import ChatMessage from "./ChatMessage";
import { Socket } from "socket.io-client";
import { TChat } from "../pages/MessengerPage";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const Chat = memo(
    ({
        token,
        socket,
        selfUsername,
        chat,
        setChat,
        onSeenFn,
        reply,
        setReply,
    }: {
        token: string | null;
        socket: Socket;
        selfUsername: string | null;
        chat: Message[];
        setChat: Dispatch<SetStateAction<TChat>>;
        onSeenFn: (index: number, message: Message) => void;
        reply: MessageReply | null;
        setReply: Dispatch<SetStateAction<MessageReply | null>>;
    }) => {
        console.log("-------------------------Chat-------------------------");

        const [autoScrollRef, autoScrollInView] = useInView({
            threshold: 0,
        });

        const scrollToBottomOnClick = useCallback(() => {
            const chatScrollable = document.getElementById("chat-scrollable");
            if (chatScrollable) {
                chatScrollable.scrollTo({
                    top: chatScrollable.offsetHeight,
                    behavior: "smooth",
                });
            }
        }, []);

        const deleteMessageOnClick = useCallback(
            (index: number, message: Message) => {
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
            },
            [token, chat]
        );

        const replyOnClick = useCallback((index: number, message: Message) => {
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
        }, []);

        return (
            <>
                <div id="chat-cont" className="text-[14px] ">
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
                    <div className="">
                        {selfUsername &&
                            chat.map((message, index) =>
                                message.sender === selfUsername ? (
                                    <ChatMessage
                                        message={message}
                                        type="sender"
                                        onSeenFn={onSeenFn}
                                        chatIndex={index}
                                        selfUsername={selfUsername}
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
    }
);

export default Chat;
