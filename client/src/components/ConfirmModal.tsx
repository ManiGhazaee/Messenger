import React, { Dispatch, SetStateAction, memo, useState } from "react";
import { createPortal } from "react-dom";

const ConfirmModal = memo(
    ({
        display,
        displayFn,
        okText,
        cancelText,
        onOkFn,
        onOkParams,
        title,
        message,
        okStyle,
        cancelStyle,
        checkBoxItems,
    }: {
        display: boolean;
        displayFn: Dispatch<SetStateAction<boolean>>;
        okText?: string;
        cancelText?: string;
        onOkFn: Function;
        onOkParams?: any[];
        title: string;
        message: string;
        okStyle?: React.CSSProperties;
        cancelStyle?: React.CSSProperties;
        checkBoxItems?: string[];
    }) => {
        const [checkBoxes, setCheckBoxes] = useState<boolean[]>(Array(checkBoxItems?.length).fill(false));

        const onOk = () => {
            if (checkBoxItems && checkBoxItems.length !== 0) {
                if (onOkParams) {
                    onOkFn(...onOkParams, checkBoxes);
                } else {
                    onOkFn(checkBoxes);
                }
            } else {
                if (onOkParams) {
                    onOkFn(...onOkParams);
                } else {
                    onOkFn();
                }
            }
        };

        return createPortal(
            <>
                <div
                    onClick={() => displayFn(false)}
                    className={`w-screen h-screen ${
                        display ? "fixed" : "hidden"
                    } top-0 left-0 z-[120] back_drop_anim_300`}
                ></div>
                <div
                    className="scale_opacity_anim_300_0_origin fixed  w-[400px] max-w-[400px] h-fit bg-black border border-borders rounded-lg top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 z-[130]"
                    style={{
                        display: display ? "block" : "none",
                    }}
                >
                    <h3 className="text-center text-[24px] font-bold my-[20px]">{title}</h3>
                    <p className="text-[14px] text-center my-[20px]">{message}</p>
                    {checkBoxItems &&
                        checkBoxes &&
                        checkBoxItems.length !== 0 &&
                        checkBoxItems.map((elem, index) => (
                            <input
                                type="checkbox"
                                checked={checkBoxes[index]}
                                onChange={() => {
                                    setCheckBoxes((prev) => {
                                        let arr = prev;
                                        arr[index] = !arr[index];
                                        return arr;
                                    });
                                }}
                            >
                                {elem}
                            </input>
                        ))}
                    <div className="flex flex-row relative bottom-0 justify-evenly mt-[40px] mb-[8px]">
                        <div
                            className="w-[calc(50%-12px)] text-center border duration-200 border-red-600 rounded text-red-600 hover:bg-red-600 hover:text-white cursor-pointer text-[14px] py-[4px]"
                            onClick={() => onOk()}
                            style={okStyle}
                        >
                            {okText || "Ok"}
                        </div>
                        <div
                            className="w-[calc(50%-12px)] text-center duration-200 border border-borders rounded cursor-pointer hover:bg-white hover:text-black hover:border-white text-[14px] py-[4px]"
                            onClick={() => displayFn(false)}
                            style={cancelStyle}
                        >
                            {cancelText || "Cancel"}
                        </div>
                    </div>
                </div>
            </>,
            document.body
        );
    }
);

export default ConfirmModal;
