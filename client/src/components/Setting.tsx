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
                    display: settingState ? "block" : "none",
                }}
                className="h-screen w-screen z-[100] backdrop-blur-sm fixed top-0 left-0"
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
                className="fixed left-0 z-[120] top-0 bg-black border-r duration-300 border-borders h-screen"
            ></div>
        </>
    );
};

export default Setting;
