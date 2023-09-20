import { Dispatch, SetStateAction } from "react";
import { TChat } from "../pages/MessengerPage";

export function addMessage(
    selfUsername: string | null,
    setChatStateFn: Dispatch<SetStateAction<TChat>>,
    message: Message
) {
    if (!selfUsername) return;

    if (message.sender === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (message.receiver in obj) {
                if (obj[message.receiver][obj[message.receiver]?.length - 1]?.index !== message.index) {
                    obj[message.receiver].push(message);
                }
            } else {
                obj[message.receiver] = [message];
            }
            return obj;
        });
    } else if (message.receiver === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (message.sender in obj) {
                if (obj[message.sender][obj[message.sender]?.length - 1]?.index !== message.index) {
                    obj[message.sender].push(message);
                }
            } else {
                obj[message.sender] = [message];
            }
            return obj;
        });
    } else {
        console.log("WTF?");
    }
}

export function setMessageStatusToSuccess(
    selfUsername: string | null,
    setChatStateFn: Dispatch<SetStateAction<TChat>>,
    message: Message
) {
    if (!selfUsername) return;

    if (message.sender === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (message.receiver in obj) {
                for (let i = obj[message.receiver].length - 1; i >= 0; i--) {
                    if (obj[message.receiver][i]?.index === message.index) {
                        obj[message.receiver][i].status = "SUCCESS";
                    }
                }
            }
            return obj;
        });
    }
}

export function deleteMessagesFor(
    selfUsername: string | null,
    setChatStateFn: Dispatch<SetStateAction<TChat>>,
    sender: string,
    receiver: string
) {
    if (!selfUsername) return;

    if (sender === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (receiver in obj) {
                delete obj[receiver];
            }
            return obj;
        });
    } else if (receiver === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (sender in obj) {
                delete obj[sender];
            }
            return obj;
        });
    } else {
        console.log("WTF?");
    }
}

export function hoursAndMinutes(time: Date | string): string {
    return `${new Date(time).getHours().toString().padStart(2, "0")}:${new Date(time)
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
}

export function setMessageSeen(
    currentRoomWith: string,
    setChatStateFn: Dispatch<SetStateAction<TChat>>,
    message: Message
) {
    setChatStateFn((prev) => {
        let obj = { ...prev };
        let firstSeenIndex: number | null = null;

        if (obj && currentRoomWith && obj[currentRoomWith]) {
            for (let i = obj[currentRoomWith].length - 1; i >= 0; i--) {
                if (obj[currentRoomWith][i].index === message.index) {
                    obj[currentRoomWith][i].seen = true;
                    firstSeenIndex = i;
                    break;
                }
            }
        }

        if (firstSeenIndex !== null) {
            if (obj && currentRoomWith && obj[currentRoomWith]) {
                for (let i = firstSeenIndex; i >= 0; i--) {
                    if (obj[currentRoomWith][i] && obj[currentRoomWith][i].seen) {
                        obj[currentRoomWith][i].seen = true;
                    }
                }
            }
        }

        return obj;
    });
}

export function deleteMessage(
    selfUsername: string | null,
    setChatStateFn: Dispatch<SetStateAction<TChat>>,
    message: Message
) {
    const chattingWith = message.sender === selfUsername ? message.receiver : message.sender;
    setChatStateFn((prev) => {
        let obj = { ...prev };
        for (let i = 0; i < obj[chattingWith].length; i++) {
            if (obj[chattingWith][i]?.index === message.index) {
                delete obj[chattingWith][i];
                break;
            }
        }
        return obj;
    });
}
