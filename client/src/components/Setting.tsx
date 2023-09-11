import React, { Dispatch, SetStateAction } from "react";

const Setting = ({
    settingState,
    setSettingState,
}: {
    settingState: boolean;
    setSettingState: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <>
            <div
                id="setting-backdrop"
                style={{
                    opacity: settingState ? "1" : "0",
                    transition: "opacity 300ms",
                    width: settingState ? "100vw" : "0",
                }}
                className="h-screen z-[100] backdrop-blur-sm fixed top-0 left-0"
                onClick={() => {
                    setSettingState(false);
                }}
            ></div>
            <div
                id="setting"
                style={{
                    width: settingState ? "300px" : "0px",
                    opacity: settingState ? "1" : "0",
                }}
                className="fixed left-0 z-[120] top-0 bg-black border-r duration-300 border-zinc-800 h-screen"
            ></div>
        </>
    );
};

export default Setting;
