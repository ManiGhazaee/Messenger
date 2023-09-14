import React, { useState } from "react";
import { ContextMenuItems } from "./ContextMenu";
import { createPortal } from "react-dom";

const MessageOptions = ({
    display,
    displayFn,
    clickPoint,
    items,
}: {
    display: boolean;
    displayFn: (...args: any[]) => void;
    clickPoint: { x: number; y: number };
    items: ContextMenuItems;
}) => {
    return (
        <>
            {display &&
                createPortal(
                    <>
                        <div
                            onClick={() => displayFn(false)}
                            className="absolute top-0 left-0 z-[130] w-screen h-screen"
                        ></div>
                        <div
                            style={{
                                top: clickPoint.y,
                                left: clickPoint.x,
                            }}
                            className="scale_opacity_anim_300 absolute z-[180] w-[180px] bg-zinc-900 border border-zinc-800 rounded-xl"
                        >
                            {items &&
                                items.length !== 0 &&
                                items.map((elem) => (
                                    <div
                                        style={elem.style}
                                        className="text-[14px] w-[calc(100%-8px)] my-[4px] active:bg-zinc-400 active:text-black mx-auto px-2 py-1 text-text_2 cursor-pointer bg-black hover:bg-zinc-800 rounded-lg"
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
    );
};

export default MessageOptions;
