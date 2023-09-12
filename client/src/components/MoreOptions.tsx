import React, { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { ContextMenuItems } from "./ContextMenu";

const MoreOptions = ({
    display,
    displayFn,
    items,
}: {
    display: boolean;
    displayFn: Dispatch<SetStateAction<boolean>>;
    items?: ContextMenuItems;
}) => {
    return (
        <>
            {display && (
                <>
                    {createPortal(
                        <>
                            <div
                                onClick={() => displayFn(false)}
                                className="absolute top-0 left-0 z-[130] w-screen h-screen"
                            ></div>
                            <div className="more_options absolute right-[18px] top-[50px] z-[180] w-[180px] bg-zinc-900 border border-zinc-800 rounded-xl">
                                {items &&
                                    items.length !== 0 &&
                                    items.map((elem) => (
                                        <div
                                            style={elem.style}
                                            className="text-[14px] w-[calc(100%-8px)] my-[4px] active:bg-zinc-400 active:text-black mx-auto px-2 py-1 text-zinc-500 cursor-pointer bg-black hover:bg-zinc-800 rounded-lg"
                                            onClick={() => {
                                                if (elem.params) {
                                                    elem.onClick(...elem.params);
                                                } else {
                                                    elem.onClick();
                                                }
                                                displayFn(false);
                                            }}
                                        >
                                            {elem.icon}
                                            {elem.text}
                                        </div>
                                    ))}
                            </div>
                        </>,
                        document.body
                    )}
                </>
            )}
        </>
    );
};

export default MoreOptions;
