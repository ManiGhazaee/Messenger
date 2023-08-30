import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type Message = {
    id: string;
    sender: string;
    content: string;
    time: Date;
};

const MessengerPage = ({
    socket,
    menu,
    id,
}: {
    socket: Socket | null;
    menu: User | null;
    id: string | null;
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [roomId, setRoomId] = useState<string>("");

    const [state, setState] = useState<"menu" | "setting" | "search" | "chat">("menu");
    useEffect(() => {
        if (socket) {
            socket.on("message", (data) => {
                console.log(data);
                setMessages((prevMessages) => [...prevMessages, data]);
            });
        }
    }, [socket]);

    const sendPrivateMessage = () => {
        const selfId = id;

        if (socket) {
            socket.emit("joinRoom", selfId);
            socket.emit("message", { sender: selfId, content: messageInput });
            console.log(selfId, messageInput);
        }
        setMessageInput("");
    };
    return (
        <div className="h-screen">
            <div
                id="nav"
                className="flex flex-row w-full py-[14px] px-[18px] border-b-[1px] border-borders"
            >
                <div
                    onClick={() => setState("setting")}
                    className="flex flex-col relative text-[22px] cursor-pointer"
                >
                    <i className="bi bi-list"></i>
                </div>
                <div
                    onClick={() => setState(state === "menu" ? "search" : "menu")}
                    className="text-[18px] ml-4 mt-[2px] cursor-pointer"
                >
                    SEARCH
                </div>
            </div>
            <div className="flex flex-col h-[calc(100%-62px)]">
                <div
                    id="search"
                    className={`bg-black w-full ${
                        state === "search" ? "h-full" : "h-0"
                    } duration-300 overflow-hidden`}
                >
                    <div className="flex flex-row w-[calc(100%-36px)] h-[38px] relative ml-[18px] mt-[14px]">
                        <input
                            type="text"
                            name=""
                            id="search-input"
                            className="bg-black border-[1px] border-borders flex-grow text-[18px] rounded-full pl-3 py-1 outline-none h-full"
                            autoComplete="off"
                        />
                        <button
                            id="search-button"
                            className="border-[1px] border-borders active:bg-white active:text-black duration-100 cursor-pointer rounded-full w-[40px] h-full relative ml-[10px]"
                        >
                            <i className="bi bi-search absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                        </button>
                    </div>
                </div>
                <div id="main" className="flex flex-row flex-grow">
                    <div
                        id="menu"
                        className={`${
                            state === "menu" || state === "setting" || state === "search"
                                ? "w-full"
                                : "w-0"
                        } sm:w-[400px] bg-gray-500 h-full`}
                    >
                        {menu &&
                            "rooms" in menu &&
                            menu.rooms.length !== 0 &&
                            menu.rooms.map((elem) => (
                                <div className="h-[20px] flex flex-row">
                                    <div className="h-full aspect-square border border-borders rounded-full bg-slate-800"></div>
                                    <div className="text-[18px]">{elem.with}</div>
                                </div>
                            ))}
                    </div>
                    <div
                        id="chat"
                        className={`${
                            state === "chat" ? "w-full" : "w-auto"
                        } flex-grow bg-gray-800 h-full`}
                    ></div>
                </div>
            </div>
            {/* <div>
                {messages.map((message, index) => (
                    <div key={index}>{`${message.sender}: ${message.content}`}</div>
                ))}
            </div>
            <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={sendPrivateMessage}>Send</button> */}
        </div>
    );
};

export default MessengerPage;
