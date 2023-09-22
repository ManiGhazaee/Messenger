import React, { memo } from "react";
import { ContextMenuItems } from "./ContextMenu";
import { createPortal } from "react-dom";

const MenuItemOptions = memo(
    ({
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
                                className="scale_opacity_anim_300 bg-black bg-opacity-60 backdrop-blur-md absolute z-[180] w-[180px] rounded-xl"
                            >
                                {items &&
                                    items.length !== 0 &&
                                    items.map((elem) => (
                                        <div
                                            style={elem.style}
                                            className="text-[14px] w-[calc(100%-8px)] my-[4px] active:bg-zinc-400 active:text-black mx-auto px-2 py-1 text-text_2 cursor-pointer bg-opacity-0 bg-black hover:bg-opacity-100 rounded-lg duration-150 hover:text-zinc-100"
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
    }
);

export default MenuItemOptions;
