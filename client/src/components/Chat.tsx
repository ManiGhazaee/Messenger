import React, { useEffect, useRef, useState } from "react";

const Chat = ({ selfUsername, chat }: { selfUsername: string | null; chat: Message[] }) => {
    const [autoScroll, setAutoScroll] = useState<boolean>(true);

    const chatMessagesRef = useRef<HTMLDivElement>(null);

    const handleToggleAutoScroll = () => {
        setAutoScroll(!autoScroll);
    };

    useEffect(() => {
        if (autoScroll && chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chat, autoScroll]);

    return (
        <>
            <div className="chat-messages" ref={chatMessagesRef}>
                {chat.map((message, index) =>
                    message.sender === selfUsername ? (
                        <div className={`flex flex-row justify-end w-[calc(100%-10px)] ml-[5px]`}>
                            <div
                                key={index}
                                className={`message relative w-fit px-3 bg-gray-600 rounded-2xl py-1 my-[2px] max-w-[70%] `}
                            >
                                {message.content}
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
