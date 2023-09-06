import { useCallback, useState } from "react";
import { Socket } from "socket.io-client";
import useSocket from "../components/useSocket";
import { addMessage, deleteMessagesFor } from "../ts/utils";
import Chat from "../components/Chat";

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

    const [newMessagesMarker, setNewMessagesMarker] = useState<number | null>(null);

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
            new_messages_marker: number | null;
        }) => {
            console.log("data of profile", data);

            if (data.new_messages_marker !== null) {
                setNewMessagesMarker(data.new_messages_marker);
            } else {
                setNewMessagesMarker(null);
            }

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

    const sendPrivateMessage = () => {
        if (messageInput.trim().length === 0) return;
        if (state !== "chat") return;
        if (socket) {
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

    useSocket(socket, "seen", (data: { message: Message }) => {
        setChat((prev) => {
            let obj = { ...prev };
            let firstSeenIndex: number | null = null;

            if (obj && currentRoomWith && obj[currentRoomWith]) {
                for (let i = obj[currentRoomWith].length - 1; i >= 0; i--) {
                    if (obj[currentRoomWith][i].index === data.message.index) {
                        obj[currentRoomWith][i].seen = true;
                        firstSeenIndex = i;
                        break;
                    }
                }
            }

            if (firstSeenIndex !== null) {
                for (let i = firstSeenIndex; i >= 0; i--) {
                    obj[currentRoomWith][i].seen = true;
                }
            }

            return obj;
        });
    });

    const onSeen = (index: number, message: Message) => {
        if (message.seen) return;
        let is_last = false;
        if (currentRoomWith && chat[currentRoomWith].length - 1 === index) is_last = true;

        if (socket) {
            socket.emit("seen", {
                token,
                id,
                index: message.index,
                message,
                is_last,
            });
        }

        setChat((prev) => {
            let obj = { ...prev };
            if (obj && currentRoomWith && obj[currentRoomWith]) {
                obj[currentRoomWith][index].seen = true;
            }
            return obj;
        });
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
                        <i className="bi bi-chevron-left"></i>
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
                        } sm:w-[400px] bg-gray-500 h-full duration-200 overflow-y-scroll`}
                    >
                        {menu &&
                            "rooms" in menu &&
                            menu.rooms.length !== 0 &&
                            menu.rooms.map((elem) => (
                                <div
                                    className="h-[60px] flex flex-row w-[100%] hover:bg-slate-300 border-borders group cursor-pointer duration-200 overflow-hidden"
                                    onClick={() => userOnClick(elem.username)}
                                >
                                    <div className="h-3/4 my-[7px] mr-[7px] ml-[18px] aspect-square rounded-full bg-slate-800"></div>
                                    <div className="flex flex-col">
                                        <div className="text-[18px] mt-[6px] ml-[10px] group-hover:text-black duration-200">
                                            {elem.username}
                                        </div>
                                        <div className="text-[14px] mt-[0px] ml-[10px] group-hover:text-black duration-200">
                                            {elem.last_message.content.length > 25
                                                ? elem.last_message.content.slice(0, 25) + "..."
                                                : elem.last_message.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div
                        id="chat"
                        className={`${
                            state === "chat" ? "w-full" : "w-0"
                        } flex-grow bg-gray-800 h-auto overflow-hidden relative`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendPrivateMessage();
                                setMessageInput(() => "");
                            }
                        }}
                    >
                        {chat && state === "chat" && (
                            <div className="h-[calc(100%-50px)] overflow-y-scroll relative flex flex-col-reverse">
                                {currentRoomWith in chat &&
                                    chat[currentRoomWith].length !== 0 &&
                                    socket && (
                                        <Chat
                                            chat={chat[currentRoomWith]}
                                            selfUsername={username}
                                            socket={socket}
                                            onSeenFn={onSeen}
                                            newMessagesMarker={newMessagesMarker}
                                        />
                                    )}
                            </div>
                        )}

                        <div className="flex flex-row w-[calc(100%-10px)] h-[40px] absolute left-0 bottom-[5px] ml-[5px]">
                            <div className="flex-grow bg-black border-borders border-[1px] h-full rounded-full px-4 ">
                                <textarea
                                    id="search-input"
                                    className="resize-none bg-black text-[14px] outline-none py-[8px] h-[100%] w-full"
                                    autoComplete="off"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Text Message"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <button
                                id="search-button"
                                className="text-black bg-white w-[40px]  active:bg-text_2 active:text-black duration-100 cursor-pointer rounded-full h-full relative ml-[5px]"
                                onClick={sendPrivateMessage}
                            >
                                <i className="bi bi-send absolute top-[53%] left-[48%] -translate-x-1/2 -translate-y-1/2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessengerPage;
