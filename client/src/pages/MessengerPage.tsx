import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type Message = {
    id: string;
    sender: string;
    content: string;
    time: Date;
};

const MessengerPage = ({ socket, menu }: { socket: Socket | null; menu: User | null }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    useEffect(() => {
        if (socket) {
            socket.on("privateMessage", (data) => {
                console.log(data);
                setMessages((prevMessages) => [...prevMessages, data]);
            });
        }
    }, [socket]);

    const sendPrivateMessage = () => {
        const recipient = "recipient-user-id";

        if (socket) {
            socket.emit("joinRoom", recipient);
            socket.emit("privateMessage", { sender: recipient, content: messageInput });
            console.log(recipient, messageInput);
        }
        setMessageInput("");
    };
    return (
        <div>
            <div>{JSON.stringify(menu)}</div>
            <div>
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
            <button onClick={sendPrivateMessage}>Send</button>
        </div>
    );
};

export default MessengerPage;
