import React, { Dispatch, SetStateAction, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import ChatMessage from "./ChatMessage";
import { Socket } from "socket.io-client";
import { TChat } from "../pages/MessengerPage";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import InfiniteScroll from "react-infinite-scroller";

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
        typing,
    }: {
        token: string | null;
        socket: Socket;
        selfUsername: string | null;
        chat: Message[];
        setChat: Dispatch<SetStateAction<TChat>>;
        onSeenFn: (index: number, message: Message) => void;
        reply: MessageReply | null;
        setReply: Dispatch<SetStateAction<MessageReply | null>>;
        typing: boolean;
    }) => {
        const [autoScrollRef, autoScrollInView] = useInView({
            threshold: 0,
        });

        const [isReadyForLoadPrevMessages, setIsReadyForLoadPrevMessages] = useState<boolean>(false);

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
                const userInChat = message.sender === selfUsername ? message.receiver : message.sender;

                socket.emit("deleteMessage", { token, message });

                setChat((prev) => {
                    let obj = { ...prev };

                    if (obj[userInChat][index]) {
                        delete obj[userInChat][index];
                    }

                    return obj;
                });
            },
            [token]
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

        const scrollToReplyTarget = useCallback((index: number) => {
            const replyTarget = document.getElementById(index.toString());
            const chatCont = document.getElementById("chat-scrollable");

            replyTarget?.classList.add("bg-zinc-900");

            setTimeout(() => {
                replyTarget?.classList.remove("bg-zinc-900");
            }, 2000);

            if (replyTarget && chatCont) {
                replyTarget.scrollIntoView({
                    behavior: "smooth",
                });
            }
        }, []);

        const contextOnClick = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
            const chatCont = document.getElementById("chat-scrollable")!;
            const rect = chatCont.getBoundingClientRect();

            const chatWidth = chatCont.offsetWidth;
            const chatHeight = chatCont.offsetHeight;

            const chatOffsetTop = rect.top + window.scrollY;
            const chatOffsetLeft = rect.left + window.scrollX;

            let x = ev.clientX;
            let y = ev.clientY;

            if (ev.clientX > chatWidth / 2 + chatOffsetLeft) {
                x = ev.clientX - 180;
            }
            if (ev.clientY > chatHeight / 2 + chatOffsetTop) {
                y = ev.clientY - 4 * 38 - 8;
            }
            return { x, y };
        }, []);

        const loadPrevMessages = useCallback(
            (token: string | null, chat: Message[], selfUsername: string, amount: number) => {
                if (!chat || !selfUsername || !amount || !socket || !token) return;

                const firstMessageInLoadedChat = chat[0];
                const last_index = firstMessageInLoadedChat.index;
                const [sender, receiver] =
                    firstMessageInLoadedChat.sender === selfUsername
                        ? [firstMessageInLoadedChat.sender, firstMessageInLoadedChat.receiver]
                        : [firstMessageInLoadedChat.receiver, firstMessageInLoadedChat.sender];

                if (!sender || !receiver || !last_index) return;

                socket.emit("loadPrevMessages", {
                    token,
                    sender,
                    receiver,
                    last_index,
                    amount,
                });
            },
            []
        );

        const { ref, inView } = useInView({
            threshold: 0,
        });

        useEffect(() => {
            const timeout = setTimeout(() => {
                setIsReadyForLoadPrevMessages(true);
            }, 1000);
            return () => {
                clearTimeout(timeout);
                setIsReadyForLoadPrevMessages(false);
            };
        }, [chat]);

        useEffect(() => {
            if (inView && selfUsername && chat && isReadyForLoadPrevMessages) {
                loadPrevMessages(token, chat, selfUsername, 30);
            }
        }, [inView, loadPrevMessages, chat, selfUsername, isReadyForLoadPrevMessages]);

        return (
            <>
                <div id="chat-cont" className="text-[14px] relative ">
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
                            style={useMemo(
                                () => ({
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    fontSize: "30px",
                                }),
                                []
                            )}
                        />
                    </div>

                    <div id="chat-messages">
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
                                        scrollToReplyTarget={scrollToReplyTarget}
                                        contextOnClick={contextOnClick}
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
                                        scrollToReplyTarget={scrollToReplyTarget}
                                        contextOnClick={contextOnClick}
                                    />
                                )
                            )}
                    </div>

                    <div
                        ref={ref}
                        onClick={() => loadPrevMessages(token, chat, selfUsername || "", 30)}
                        className="absolute top-0 w-full h-[10px]"
                    ></div>

                    <div
                        className={`${
                            typing ? "h-[30px] opacity-100 py-[4px]" : "h-0 opacity-0 py-[0px]"
                        } delay-300 px-[16px] text-zinc-600 font-bold ease-in-out w-full duration-150`}
                    >
                        Typing
                        <span className="animate-pulse ">.</span>
                        <span className="animate-pulse anim_delay_200">.</span>
                        <span className="animate-pulse anim_delay_400">.</span>
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
