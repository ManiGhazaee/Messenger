import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import useSocket from "../components/useSocket";
import { addMessage, deleteMessage, deleteMessagesFor, setMessageSeen, setMessageStatusToSuccess } from "../ts/utils";
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
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { ConnectionStatus } from "../App";

export type TChat = {
    [key: string]: Message[];
};

const MessengerPage = memo(
    ({
        socket,
        connectionStatus,
        menu,
        username,
        token,
    }: {
        socket: Socket | null;
        connectionStatus: ConnectionStatus;
        menu: User | null;
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
        const [profileResponseMessage, setProfileResponseMessage] = useState<string | null>(null);
        const [chat, setChat] = useState<TChat>({
            [username || ""]: [],
        });
        const [chatMoreModalDisplay, setChatMoreModalDisplay] = useState<boolean>(false);
        const [clearHistoryConfirmModal, setClearHistoryConfirmModal] = useState<boolean>(false);
        const [deleteChatConfirmModal, setDeleteChatConfirmModal] = useState<boolean>(false);
        const [reply, setReply] = useState<MessageReply | null>(null);
        const [sentTyping, setSentTyping] = useState<boolean>(false);
        const [typingTimeout, setTypingTimeout] = useState<boolean>(true);
        const [typers, setTypers] = useState<string[]>([]);
        const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

        const navigate = useNavigate();

        const memoizedToken = useMemo(() => token, [token]);
        const memoizedChat = useMemo(() => chat, [chat]);
        const memoizedUsername = useMemo(() => username, [username]);
        const memoizedReply = useMemo(() => reply, [reply]);
        const memoizedMenu = useMemo(() => menu, [menu]);
        const memoizedSearchState = useMemo(() => searchState, [searchState]);
        const memoizedState = useMemo(() => state, [state]);
        const memoizedChatUsername = useMemo(() => chatUsername, [chatUsername]);
        const memoizedSettingState = useMemo(() => settingState, [settingState]);
        const memoizedCurrentRoomWith = useMemo(() => currentRoomWith, [currentRoomWith]);

        const chatRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!token) {
                navigate("/login");
            }
        }, []);

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
                if (data.success && data.message === "No messages") {
                    setProfileResponseMessage("No Messages Found");
                }

                if (!data.success && "message" in data) {
                    setProfileResponseMessage((prev) => {
                        prev = data.message;
                        return prev;
                    });
                }

                if ((!("messages" in data) || data.messages.length === 0) && username && currentRoomWith) {
                    deleteMessagesFor(username, setChat, username, currentRoomWith);
                    return;
                }

                if ("messages" in data && data.messages && data.messages.length) {
                    setProfileResponseMessage(null);
                    deleteMessagesFor(username, setChat, data.messages[0].sender, data.messages[0].receiver);
                    for (let i = data.messages.length - 1; i >= 0; i--) {
                        addMessage(username, setChat, data.messages[i]);
                    }
                }

                const chatMessagesCont = document.getElementById("chat-messages");
                if (chatMessagesCont && chatMessagesCont.children.length > 0) {
                    chatMessagesCont.children[chatMessagesCont.children.length - 1].scrollIntoView();
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
            setMessageSeen(currentRoomWith, setChat, data.message);
        });

        useSocket(socket, "deleteMessage", (data: { message: Message }) => {
            deleteMessage(username, setChat, data.message);
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

            if (reply !== null) {
                message.reply = reply;
                setReply(null);
            }

            if (socket) {
                socket.emit("typing", { status: "END", sender: username, receiver: currentRoomWith });
                setSentTyping(false);
                setTypingTimeout(true);
            }

            setChat((prev) => {
                let obj: TChat = { ...prev };
                if (message.receiver in obj) {
                    if (obj[message.receiver][obj[message.receiver].length - 1].index !== message.index) {
                        obj[message.receiver].push(message);
                    }
                } else {
                    obj[message.receiver] = [message];
                }
                return obj;
            });

            if (socket) {
                socket.emit("message", {
                    token: memoizedToken,
                    index: messageIndex,
                    reply: message.reply,
                    sender: username,
                    receiver: currentRoomWith,
                    content: messageInput,
                    time: new Date(),
                });
                socket.emit("menu", { token });
            }
            setMessageInput("");
        };

        const searchOnClick = useCallback(() => {
            if (socket) {
                socket.emit("search", { token: memoizedToken, search: searchInput });
            }
        }, [socket, memoizedToken, searchInput]);

        const userOnClick = useCallback(
            (username: string) => {
                setCurrentRoomWith(() => username);
                setState("chat");
                setSearchState(false);
                setReply(null);
                setChatUsername(username);
                if (socket) {
                    socket.emit("profile", { token: memoizedToken, username });
                }

                const messageInput = document.getElementById("message-input");
                if (messageInput) {
                    messageInput.focus();
                }
            },
            [socket, memoizedToken]
        );

        const moreOnClick = useCallback((state: "chat" | "menu") => {
            setState("menu");
            if (state === "menu") {
                setSettingState(true);
            }
            setChatUsername(null);
            setProfileResponseMessage(null);
            setReply(null);
        }, []);

        const onSeen = (index: number, message: Message) => {
            if (message.seen) return;
            let is_last = false;

            if (currentRoomWith && chat[currentRoomWith].length - 1 === index) is_last = true;

            if (socket) {
                socket.emit("seen", {
                    token: memoizedToken,
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
        const chatMoreOnClick = useCallback(
            (state: "chat" | "menu") => {
                if (state !== "chat") return;
                setChatMoreModalDisplay(!chatMoreModalDisplay);
            },
            [chatMoreModalDisplay]
        );

        const clearHistory = useCallback(() => {
            setClearHistoryConfirmModal(false);
            if (socket) {
                socket.emit("clearHistory", {
                    token: memoizedToken,
                    sender: memoizedUsername,
                    receiver: memoizedCurrentRoomWith,
                });
            }
        }, [socket, memoizedToken, memoizedCurrentRoomWith, memoizedUsername]);

        const deleteChat = useCallback(() => {
            setDeleteChatConfirmModal(false);
            if (socket) {
                socket.emit("deleteChat", {
                    token: memoizedToken,
                    sender: memoizedUsername,
                    receiver: memoizedCurrentRoomWith,
                });
            }
        }, [socket, memoizedToken, memoizedUsername, memoizedCurrentRoomWith]);

        useSocket(socket, "typing", (data: { status: "START" | "END"; sender: string; receiver: string }) => {
            if (data.status === "START") {
                setTypers((prev) => {
                    if (prev.includes(data.sender)) {
                        return prev;
                    } else {
                        const _prev = [...typers];
                        _prev.push(data.sender);

                        return _prev;
                    }
                });
            } else if (data.status === "END") {
                setTypers((prev) => {
                    if (!prev.includes(data.sender)) {
                        return prev;
                    } else {
                        const _prev = [...typers];
                        const index = _prev.indexOf(data.sender);
                        if (index !== -1) _prev.splice(index, 1);
                        return _prev;
                    }
                });
            }
        });

        const sendTyping = (typerUsername: string | null) => {
            if (socket && !sentTyping && typerUsername && currentRoomWith) {
                socket.emit("typing", { status: "START", sender: typerUsername, receiver: currentRoomWith });
                setSentTyping(true);
            }
            if (typingTimeout) {
                setTimeout(() => {
                    setSentTyping(false);
                    setTypingTimeout(true);
                    if (socket && typerUsername && currentRoomWith) {
                        socket.emit("typing", { status: "END", sender: typerUsername, receiver: currentRoomWith });
                    }
                }, 1000);
                setTypingTimeout(false);
            }
        };

        useSocket(socket, "onlineUsers", (data: { [key: string]: boolean }) => {
            setOnlineUsers(data);
        });

        useEffect(() => {
            if (!menu) return;

            let users: Record<string, boolean> = {};
            for (const i of menu.rooms) {
                users[i.username] = false;
            }
            if (socket) {
                socket.emit("onlineUsers", users);
            }
            const inter = setInterval(() => {
                if (socket) {
                    socket.emit("onlineUsers", users);
                }
            }, 20000);
            return () => clearInterval(inter);
        }, [menu]);

        useSocket(socket, "loadPrevMessages", (data: { messages: Message[] }) => {
            console.log("LOAD_PREV_MESSAGES", data);

            const chatWith = data.messages[0].sender === username ? data.messages[0].receiver : data.messages[0].sender;

            if (!chatWith) return;

            setChat((prev) => {
                let _prev = { ...prev };
                _prev[chatWith]?.unshift(...data.messages);
                return _prev;
            });

            const chatMessagesCont = document.getElementById("chat-messages");

            let prevFirstMessage: HTMLElement;
            if (chatMessagesCont) {
                if (chatMessagesCont.children.length >= 30) {
                    prevFirstMessage = chatMessagesCont.children[30] as HTMLElement;
                } else {
                    prevFirstMessage = chatMessagesCont.children[chatMessagesCont.children.length - 1] as HTMLElement;
                }
                prevFirstMessage.scrollIntoView();
            }
        });

        return (
            <div className="h-[var(--h-screen)] overflow-hidden">
                <Setting
                    username={memoizedUsername}
                    settingState={memoizedSettingState}
                    setSettingState={useMemo(() => setSettingState, [setSettingState])}
                />
                <Nav
                    searchState={memoizedSearchState}
                    setSearchState={useMemo(() => setSearchState, [setSearchState])}
                    moreOnClick={moreOnClick}
                    state={memoizedState}
                    chatUsername={memoizedChatUsername}
                    chatMoreOnClick={chatMoreOnClick}
                    connectionStatus={connectionStatus}
                    onlineStatus={onlineUsers[memoizedChatUsername ?? ""] ?? false}
                />
                <MoreOptions
                    items={useMemo(
                        () => [
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
                        ],
                        []
                    )}
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
                <div className="flex flex-col h-[calc(100%-60px)] overflow-hidden">
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
                        className={`flex flex-row ${searchState ? "h-0" : "h-full"} overflow-hidden duration-300`}
                    >
                        <Menu
                            menu={memoizedMenu}
                            state={state}
                            userOnClick={userOnClick}
                            chatUsername={memoizedChatUsername}
                            onlineUsers={onlineUsers}
                            chat={chat}
                            typers={typers}
                            setClearHistoryConfirmModal={setClearHistoryConfirmModal}
                            setDeleteChatConfirmModal={setDeleteChatConfirmModal}
                        />
                        <div
                            id="chat"
                            className={`${
                                state === "chat" ? "w-full" : "w-0"
                            } flex-grow bg-black overflow-hidden duration-200 relative`}
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
                                    className={`h-[calc(100%-46px)] overflow-y-scroll relative flex flex-col-reverse fade_in_anim`}
                                    ref={chatRef}
                                >
                                    {currentRoomWith in chat && chat[currentRoomWith].length !== 0 && socket ? (
                                        <Chat
                                            token={memoizedToken}
                                            chat={chat[currentRoomWith]}
                                            setChat={setChat}
                                            selfUsername={memoizedUsername}
                                            socket={socket}
                                            onSeenFn={onSeen}
                                            reply={memoizedReply}
                                            setReply={setReply}
                                            typing={typers.indexOf(currentRoomWith) !== -1}
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

                            <div
                                style={{
                                    height: reply !== null ? "60px" : "0px",
                                }}
                                className="flex flex-row duration-200 overflow-hidden border border-zinc-800 bg-zinc-900 w-[calc(100%-10px)] h-[60px] rounded-t-[20px] absolute left-0 bottom-[25px] ml-[5px] py-[8px] px-[16px] text-[14px]"
                            >
                                <ReplyRoundedIcon
                                    className="text-blue-500"
                                    style={{
                                        marginRight: "9px",
                                        top: "-2px",
                                        position: "relative",
                                        fontSize: "24px",
                                    }}
                                />
                                <span className="text-blue-400 mr-2">
                                    {reply?.sender}
                                    {":"}
                                </span>

                                <span className="">
                                    {reply?.content && reply?.content.length > 30
                                        ? reply?.content.slice(0, 30) + "..."
                                        : reply?.content}
                                </span>
                                <div
                                    onClick={() => setReply(null)}
                                    className="absolute text-zinc-500 right-[3px] cursor-pointer hover:text-zinc-200 duration-200"
                                >
                                    <CloseRoundedIcon
                                        style={{
                                            marginRight: "9px",
                                            top: "-2px",
                                            position: "relative",
                                            fontSize: "24px",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row w-[calc(100%-10px)] h-[40px] absolute left-0 bottom-[4px] ml-[5px]">
                                <div className="flex-grow bg-zinc-900 border-zinc-800 border-[1px] h-full rounded-full pl-4 pr-11 ">
                                    <textarea
                                        id="message-input"
                                        className="resize-none placeholder:text-zinc-500 bg-zinc-900 text-[14px] outline-none py-[8px] h-full w-full"
                                        autoComplete="off"
                                        value={messageInput}
                                        onChange={(e) => {
                                            sendTyping(username);
                                            setMessageInput(e.target.value);
                                        }}
                                        placeholder="Text Message"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <button
                                        id="message-button"
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
    }
);

export default MessengerPage;
