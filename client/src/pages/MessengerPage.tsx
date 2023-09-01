import { useState } from "react";
import { Socket } from "socket.io-client";
import useSocket from "../components/useSocket";
import { addMessage, deleteMessagesFor } from "../ts/utils";

type SearchResult = {
    success: boolean;
    message: string;
    users: { username: string; bio: string }[];
};

export type TChat = {
    [key: string]: Message[];
};

const MessengerPage = ({
    socket,
    menu,
    id,
    username,
    token,
}: {
    socket: Socket | null;
    menu: User | null;
    id: string | null;
    username: string | null;
    token: string | null;
}) => {
    const [messageInput, setMessageInput] = useState("");
    const [searchResult, setSearchResult] = useState<SearchResult>();
    const [searchInput, setSearchInput] = useState<string>("");
    const [currentRoomWith, setCurrentRoomWith] = useState<string>("");

    const [state, setState] = useState<"menu" | "setting" | "chat">("menu");
    const [searchState, setSearchState] = useState<boolean>(false);
    const [chatUsername, setChatUsername] = useState<string | null>(null);

    const [chat, setChat] = useState<TChat>({
        [username || ""]: [],
    });

    useSocket(socket, "search", (data: SearchResult) => {
        setSearchResult(data);
    });
    useSocket(
        socket,
        "profile",
        (data: {
            username: string;
            bio: boolean;
            room_id: string;
            messages: Message[];
            message: string;
            success: boolean;
        }) => {
            console.log(data);
            if ("messages" in data && data.messages && data.messages.length) {
                deleteMessagesFor(username, setChat, data.messages[0]);
                for (let i = data.messages.length - 1; i >= 0; i--) {
                    addMessage(username, setChat, data.messages[i]);
                }
            }
        }
    );
    useSocket(socket, "message", (data: { message: Message; success: boolean }) => {
        addMessage(username, setChat, data.message);
    });

    console.count("rendered");

    const sendPrivateMessage = () => {
        if (socket) {
            socket.emit("join", { token, id });
            socket.emit("message", {
                token,
                sender: username,
                receiver: currentRoomWith,
                content: messageInput,
                time: new Date(),
            });
            socket.emit("menu", { token, id });
        }
        setMessageInput("");
    };

    const searchOnClick = () => {
        if (socket) {
            socket.emit("search", { token, id, search: searchInput });
        }
    };

    const userOnClick = (username: string) => {
        setCurrentRoomWith(() => username);
        setState("chat");
        setSearchState(false);
        setChatUsername(username);
        if (socket) {
            socket.emit("profile", { token, id, username });
        }
    };

    const moreOnClick = () => {
        setState("setting");
        setChatUsername(null);
    };

    return (
        <div className="h-screen">
            <div
                id="nav"
                className="flex flex-row w-full py-[14px] px-[18px] border-b-[1px] border-borders relative"
            >
                <div
                    onClick={moreOnClick}
                    className="flex flex-col relative text-[22px] cursor-pointer"
                >
                    {state === "chat" ? (
                        <i className="bi bi-arrow-left"></i>
                    ) : (
                        <i className="bi bi-list"></i>
                    )}
                </div>
                <div className="text-[18px] ml-4 mt-[2px] flex flex-row">
                    {chatUsername ? (
                        <div className="h-[33px] mt-[-2px] mr-[18px] aspect-square rounded-full bg-slate-800"></div>
                    ) : (
                        <></>
                    )}
                    {chatUsername ? chatUsername : "Messenger"}
                </div>
                <div
                    onClick={() => setSearchState(!searchState)}
                    className="absolute right-[31px] top-[31px]"
                >
                    {searchState ? (
                        <i className="bi bi-x-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                    ) : (
                        <i className="bi bi-search absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                    )}
                </div>
            </div>
            <div className="flex flex-col h-[calc(100%-62px)]">
                <div
                    id="search"
                    className={`bg-black w-full ${
                        searchState ? "h-full" : "h-0"
                    } duration-300 overflow-hidden`}
                >
                    <div className="flex flex-row w-[calc(100%-36px)] h-[40px] relative ml-[18px] mt-[14px]">
                        <input
                            type="text"
                            name=""
                            id="search-input"
                            className="bg-black border-[1px] border-borders flex-grow text-[18px] rounded-full pl-3 py-1 outline-none h-full"
                            autoComplete="off"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search users"
                        />
                        <button
                            id="search-button"
                            className="border-[1px] border-borders active:bg-white active:text-black duration-100 cursor-pointer rounded-full w-[40px] h-full relative ml-[10px]"
                            onClick={searchOnClick}
                        >
                            <i className="bi bi-search absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                        </button>
                    </div>
                    {searchResult &&
                        searchResult.users.length !== 0 &&
                        searchResult.users.map((elem) => (
                            <div
                                className="h-[60px] flex flex-row w-[calc(100%-36px)] ml-[18px] my-[10px] border border-borders rounded-full group hover:bg-white cursor-pointer duration-200"
                                onClick={() => userOnClick(elem.username)}
                            >
                                <div className="h-3/4 my-[7px] mx-[7px] aspect-square rounded-full bg-slate-800"></div>
                                <div className="text-[22px] my-[12px] ml-[10px] group-hover:text-black duration-200">
                                    {elem.username}
                                </div>
                            </div>
                        ))}
                </div>
                <div
                    id="main"
                    className={`flex flex-row ${
                        searchState ? "h-0" : "h-full"
                    } overflow-hidden duration-300`}
                >
                    <div
                        id="menu"
                        className={`${
                            state === "menu" || state === "setting" ? "w-full" : "w-0"
                        } sm:w-[400px] bg-gray-500 h-full duration-200`}
                    >
                        {menu &&
                            "rooms" in menu &&
                            menu.rooms.length !== 0 &&
                            menu.rooms.map((elem) => (
                                <div
                                    className="h-[20px] flex flex-row"
                                    onClick={() => userOnClick(elem.username)}
                                >
                                    <div className="h-full aspect-square border border-borders rounded-full bg-slate-800"></div>
                                    <div className="text-[18px]">{elem.username}</div>
                                </div>
                            ))}
                    </div>
                    <div
                        id="chat"
                        className={`${
                            state === "chat" ? "w-full" : "w-0"
                        } flex-grow bg-gray-800 h-auto overflow-hidden`}
                    >
                        {chat && (
                            <div>
                                {currentRoomWith in chat &&
                                    chat[currentRoomWith].length !== 0 &&
                                    chat[currentRoomWith].map((message: Message) => (
                                        <div>{`${message.sender}: ${message.content}`}</div>
                                    ))}
                            </div>
                        )}

                        <input
                            type="text"
                            className="outline-none bg-black"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message"
                        />
                        <button
                            onClick={sendPrivateMessage}
                            className="bg-black hover:bg-white hover:text-black"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessengerPage;
