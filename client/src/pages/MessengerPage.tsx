import { useState } from "react";
import { Socket } from "socket.io-client";
import useSocket from "../components/useSocket";
import { addMessage, deleteMessagesFor, setMessageStatusToSuccess } from "../ts/utils";
import Chat from "../components/Chat";
import Loading from "../components/Loading";
import Setting from "../components/Setting";
import Search from "../components/Search";
import Nav from "../components/Nav";
import ConfirmModal from "../components/ConfirmModal";
import MoreOptions from "../components/MoreOptions";
import Menu from "../components/Menu";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

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
    const [state, setState] = useState<"menu" | "chat">("menu");
    const [searchState, setSearchState] = useState<boolean>(false);
    const [settingState, setSettingState] = useState<boolean>(false);
    const [chatUsername, setChatUsername] = useState<string | null>(null);
    const [newMessagesMarker, setNewMessagesMarker] = useState<number | null>(null);
    const [profileResponseMessage, setProfileResponseMessage] = useState<string | null>(null);
    const [chat, setChat] = useState<TChat>({
        [username || ""]: [],
    });
    const [chatMoreModalDisplay, setChatMoreModalDisplay] = useState<boolean>(false);
    const [clearHistoryConfirmModal, setClearHistoryConfirmModal] = useState<boolean>(false);
    const [deleteChatConfirmModal, setDeleteChatConfirmModal] = useState<boolean>(false);

    console.log(chat);

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
            console.log("profile data", data);
            if (data.success && data.message === "No messages") {
                setProfileResponseMessage("No Messages Found");
            }

            if (!data.success && "message" in data) {
                setProfileResponseMessage((prev) => {
                    prev = data.message;
                    return prev;
                });
            }

            if (data.new_messages_marker !== null) {
                setNewMessagesMarker(data.new_messages_marker);
            } else {
                setNewMessagesMarker(null);
            }

            if (
                (!("messages" in data) || data.messages.length === 0) &&
                username &&
                currentRoomWith
            ) {
                deleteMessagesFor(username, setChat, username, currentRoomWith);
                return;
            }

            if ("messages" in data && data.messages && data.messages.length) {
                setProfileResponseMessage(null);
                deleteMessagesFor(
                    username,
                    setChat,
                    data.messages[0].sender,
                    data.messages[0].receiver
                );
                for (let i = data.messages.length - 1; i >= 0; i--) {
                    addMessage(username, setChat, data.messages[i]);
                }
            }
        }
    );
    useSocket(socket, "message", (data: { message: Message; success: boolean }) => {
        if (data.message.sender === username) {
            setMessageStatusToSuccess(username, setChat, data.message);
        } else {
            addMessage(username, setChat, data.message);
        }
    });
    useSocket(socket, "seen", (data: { message: Message }) => {
        console.log("seen data", data);
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

    useSocket(socket, "deleteMessage", (data: { message: Message }) => {
        const chattingWith =
            data.message.sender === username ? data.message.receiver : data.message.sender;
        setChat((prev) => {
            let obj = { ...prev };
            for (let i = 0; i < obj[chattingWith].length; i++) {
                if (obj[chattingWith][i]?.index === data.message.index) {
                    delete obj[chattingWith][i];
                    break;
                }
            }
            return obj;
        });
    });

    const sendPrivateMessage = () => {
        if (messageInput.trim().length === 0) return;
        if (!username) return;
        if (state !== "chat") return;

        let messageIndex: number;
        if (chat && currentRoomWith && chat[currentRoomWith] && chat[currentRoomWith].length > 0) {
            messageIndex = chat[currentRoomWith][chat[currentRoomWith].length - 1].index + 1;
        } else {
            messageIndex = 0;
        }

        const message: Message = {
            status: "WAITING",
            index: messageIndex,
            sender: username,
            receiver: currentRoomWith,
            seen: false,
            content: messageInput,
            time: new Date(),
        };

        setChat((prev) => {
            let obj: TChat = { ...prev };
            if (message.receiver in obj) {
                if (
                    obj[message.receiver][obj[message.receiver].length - 1].index !== message.index
                ) {
                    obj[message.receiver].push(message);
                }
            } else {
                obj[message.receiver] = [message];
            }
            return obj;
        });

        if (socket) {
            socket.emit("message", {
                token,
                index: messageIndex,
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
        setState("menu");
        if (state === "menu") {
            setSettingState(true);
        }
        setChatUsername(null);
        setProfileResponseMessage(null);
    };

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

    const chatMoreOnClick = () => {
        if (state !== "chat") return;
        setChatMoreModalDisplay(!chatMoreModalDisplay);
    };
    const clearHistory = () => {
        setClearHistoryConfirmModal(false);
        if (socket) {
            socket.emit("clearHistory", { token, id, sender: username, receiver: currentRoomWith });
        }
    };
    const deleteChat = () => {
        setDeleteChatConfirmModal(false);
        if (socket) {
            socket.emit("deleteChat", { token, id, sender: username, receiver: currentRoomWith });
        }
    };

    return (
        <div className="h-screen">
            <Setting settingState={settingState} setSettingState={setSettingState} />
            <Nav
                searchState={searchState}
                setSearchState={setSearchState}
                moreOnClick={moreOnClick}
                state={state}
                chatUsername={chatUsername}
                chatMoreOnClick={chatMoreOnClick}
            />
            <MoreOptions
                items={[
                    {
                        text: "Clear History",
                        onClick: () => {
                            setClearHistoryConfirmModal(true);
                        },
                        icon: (
                            <RestoreRoundedIcon
                                style={{ marginRight: "10px", top: "-1px", position: "relative" }}
                            />
                        ),
                    },
                    {
                        text: "Delete Chat",
                        onClick: () => {
                            setDeleteChatConfirmModal(true);
                        },
                        style: { color: "red" },

                        icon: (
                            <DeleteOutlineRoundedIcon
                                style={{ marginRight: "10px", top: "-1px", position: "relative" }}
                            />
                        ),
                    },
                ]}
                display={chatMoreModalDisplay}
                displayFn={setChatMoreModalDisplay}
            />
            <ConfirmModal
                display={clearHistoryConfirmModal}
                displayFn={setClearHistoryConfirmModal}
                onOkFn={clearHistory}
                title="Clear History"
                message={`This will clear all messages. Are you sure you want to clear the history with ${currentRoomWith}?`}
                okText="Yes"
                cancelText="No"
            />
            <ConfirmModal
                display={deleteChatConfirmModal}
                displayFn={setDeleteChatConfirmModal}
                onOkFn={deleteChat}
                title="Delete Chat"
                message={`This will remove ${currentRoomWith} from your menu and delete all messages for both sides. Are you sure you want to delete chat with ${currentRoomWith}?`}
                okText="Yes"
                cancelText="No"
            />
            <div className="flex flex-col h-[calc(100%-62px)]">
                <Search
                    searchState={searchState}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    searchOnClick={searchOnClick}
                    searchResult={searchResult}
                    userOnClick={userOnClick}
                />
                <div
                    id="main"
                    className={`flex flex-row ${
                        searchState ? "h-0" : "h-full"
                    } overflow-hidden duration-300`}
                >
                    <Menu menu={menu} state={state} userOnClick={userOnClick} />
                    <div
                        id="chat"
                        className={`${
                            state === "chat" ? "w-full" : "w-0"
                        } flex-grow bg-black h-auto overflow-hidden duration-200 relative`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendPrivateMessage();
                                setMessageInput(() => "");
                            }
                        }}
                    >
                        {chat && state === "chat" && (
                            <div
                                id="chat-scrollable"
                                className={`h-[calc(100%-50px)] overflow-y-scroll relative flex flex-col-reverse`}
                            >
                                {currentRoomWith in chat &&
                                chat[currentRoomWith].length !== 0 &&
                                socket ? (
                                    <Chat
                                        token={token}
                                        id={id}
                                        chat={chat[currentRoomWith]}
                                        setChat={setChat}
                                        selfUsername={username}
                                        socket={socket}
                                        onSeenFn={onSeen}
                                        newMessagesMarker={newMessagesMarker}
                                        setNewMessagesMarker={setNewMessagesMarker}
                                    />
                                ) : (
                                    <>
                                        {profileResponseMessage !== null ? (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-zinc-900 rounded-2xl text-[14px]">
                                                {profileResponseMessage}
                                            </div>
                                        ) : (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale_opacity_anim_300 px-1 py-1 bg-zinc-900 rounded-2xl text-[14px]">
                                                <Loading color="white" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        <div className="flex flex-row w-[calc(100%-10px)] h-[40px] absolute left-0 bottom-[5px] ml-[5px]">
                            <div className="flex-grow bg-zinc-900 border-zinc-800 border-[1px] h-full rounded-full pl-4 pr-11 ">
                                <textarea
                                    id="search-input"
                                    className="resize-none placeholder:text-zinc-500 bg-zinc-900 text-[14px] outline-none py-[8px] h-full w-full"
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
                                <button
                                    id="search-button"
                                    className="text-blue-500 absolute top-0 right-[8px] bg-w-[40px] active:text-blue-300 duration-100 cursor-pointer rounded-full aspect-square h-full ml-[5px]"
                                    onClick={sendPrivateMessage}
                                >
                                    <SendRoundedIcon
                                        style={{
                                            marginLeft: "4px",
                                        }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessengerPage;
