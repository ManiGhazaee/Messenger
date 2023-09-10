import React from "react";
import Loading from "./Loading";

const Menu = ({ menu, state, userOnClick }: { menu: User | null; state: "chat" | "menu"; userOnClick: (username: string) => void }) => {
    return (
        <div
            id="menu"
            className={`${
                state === "menu" ? "w-full" : "w-0"
            } relative sm:w-[400px] bg-zinc-950 md:border-r md:border-r-borders h-full duration-200 overflow-y-scroll`}
        >
            {menu && "rooms" in menu && menu.rooms.length !== 0 ? (
                menu.rooms.map((elem) => (
                    <div
                        className="scale_opacity_anim_300 h-[60px] flex flex-row w-[100%] hover:bg-zinc-400 border-borders group cursor-pointer duration-200 overflow-hidden"
                        onClick={() => userOnClick(elem.username)}
                    >
                        <div className="h-3/4 my-[7px] mr-[7px] ml-[18px] aspect-square rounded-full bg-zinc-800"></div>
                        <div className="flex flex-col relative w-full">
                            <div className="text-[18px] mt-[6px] ml-[10px] font-semibold group-hover:text-black duration-200">{elem.username}</div>
                            <div className="text-[14px] text-zinc-500 mt-[0px] ml-[10px] max-w-[50%] overflow-hidden group-hover:text-black duration-200">
                                {elem.last_message.content.length > 25 ? elem.last_message.content.slice(0, 25) + "..." : elem.last_message.content}
                            </div>

                            <div className="ml-[0px] h-[20px] absolute bottom-[8px] text-zinc-500 group-hover:text-black duration-200 right-[8px] inline-block w-[72px] text-right">
                                <div className="inline-block text-right mr-[8px] text-[12px]  w-fit ">{`${new Date(elem.last_message.time)
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")}:${new Date(elem.last_message.time).getMinutes().toString().padStart(2, "0")}`}</div>

                                {elem.username === elem.last_message.receiver &&
                                    (elem.last_message.seen ? (
                                        <i className="bi bi-check2-all mr-[8px]"></i>
                                    ) : (
                                        <i className="bi bi-check2 mr-[8px]"></i>
                                    ))}
                            </div>

                            {elem.not_seen_count > 0 && (
                                <div className="absolute bg-white font-bold rounded-full h-fit px-[2px] py-[3px] group-hover:bg-black group-hover:text-white duration-200 min-w-[23px] text-center text-black text-[12px] right-[14px] top-[8px] ">
                                    {elem.not_seen_count}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div key="menu-loading" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale_opacity_anim_300 px-1 py-1 bg-zinc-800 rounded-2xl text-[14px]">
                    <Loading color="white" />
                </div>
            )}
        </div>
    );
};

export default Menu;
