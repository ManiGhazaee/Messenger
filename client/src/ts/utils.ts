import { Dispatch, SetStateAction } from "react";
import { TChat } from "../pages/MessengerPage";

export function addMessage(selfUsername: string | null, setChatStateFn: Dispatch<SetStateAction<TChat>>, message: Message) {
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

export function setMessageStatusToSuccess(selfUsername: string | null, setChatStateFn: Dispatch<SetStateAction<TChat>>, message: Message) {
    if (!selfUsername) return;

    if (message.sender === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (message.receiver in obj) {
                for (let i = obj[message.receiver].length - 1; i >= 0; i--) {
                    if (obj[message.receiver][i].index === message.index) {
                        obj[message.receiver][i].status = "SUCCESS";
                    }
                }
            }
            return obj;
        });
    }
}

export function deleteMessagesFor(selfUsername: string | null, setChatStateFn: Dispatch<SetStateAction<TChat>>, message: Message) {
    if (!selfUsername) return;

    if (message.sender === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (message.receiver in obj) {
                delete obj[message.receiver];
            }
            return obj;
        });
    } else if (message.receiver === selfUsername) {
        setChatStateFn((prev) => {
            let obj: TChat = { ...prev };
            if (message.sender in obj) {
                delete obj[message.sender];
            }
            return obj;
        });
    } else {
        console.log("WTF?");
    }
}
