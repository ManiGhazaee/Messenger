import { useEffect } from "react";
import { Socket } from "socket.io-client";

function useSocket(socket: Socket | null, event: string, callback: (...args: any[]) => void) {
    useEffect(() => {
        if (socket) {
            socket.on(event, callback);

            return () => {
                socket.off(event, callback);
            };
        }
    }, [socket, event, callback]);
}

export default useSocket;
