import { Dispatch, SetStateAction } from "react";
import { TChat } from "../pages/MessengerPage";

export function addMessage(
    selfUsername: string | null,
    setChatStateFn: Dispatch<SetStateAction<TChat>>,
    message: Message
) {
    if (selfUsername) {
        if (message.sender === selfUsername) {
            setChatStateFn((prev) => {
                let obj: TChat = { ...prev };
                if (message.receiver in obj) {
                    if (obj[message.receiver][obj[message.receiver].length - 1].ms !== message.ms) {
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
                    if (obj[message.sender][obj[message.sender].length - 1].ms !== message.ms) {
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
}

export function deleteMessagesFor(
    selfUsername: string | null,
    setChatStateFn: Dispatch<SetStateAction<TChat>>,
    message: Message
) {
    if (selfUsername) {
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
}
