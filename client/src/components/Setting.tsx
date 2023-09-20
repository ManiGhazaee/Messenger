import React, { Dispatch, SetStateAction, memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ConfirmModal from "./ConfirmModal";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { TOKEN_STORAGE_KEY } from "../App";

const Setting = memo(
    ({
        settingState,
        setSettingState,
        username,
    }: {
        settingState: boolean;
        setSettingState: Dispatch<SetStateAction<boolean>>;
        username: string | null;
    }) => {
        const [logoutConfirmModal, setLogoutConfirmModal] = useState<boolean>(false);
        const navigate = useNavigate();

        const logoutOnClick = () => {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            navigate("/login");
        };

        return (
            <>
                <div
                    id="setting-backdrop"
                    style={{
                        opacity: settingState ? "1" : "0",
                        transition: "opacity 300ms",
                        width: settingState ? "100vw" : "0",
                    }}
                    className="h-screen z-[100] fixed top-0 left-0"
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
                    className="fixed left-0 z-[120] top-0 rounded-r-lg bg-opacity-60 backdrop-blur-md bg-zinc-900 duration-300 h-screen overflow-hidden"
                >
                    <div className="relative">
                        {settingState && (
                            <>
                                <div
                                    id="prof"
                                    className="bg-black bg-opacity-0 rounded-lg w-[calc(100%-8px)] mx-auto py-[40px] mt-1"
                                >
                                    <div
                                        id="prof-pic"
                                        className="bg-zinc-700 scale_opacity_anim_300_0_origin anim_delay_100  rounded-full w-[100px] aspect-square text-center mx-auto mb-[20px]"
                                    ></div>
                                    <div
                                        id="prof-name"
                                        className="text-[28px] font-bold text-center scale_opacity_anim_300_0_origin anim_delay_200"
                                    >
                                        {username}
                                    </div>
                                </div>
                                <Link
                                    to="/"
                                    className="block w-[calc(100%-8px)] scale_opacity_anim_300_0_origin anim_delay_300 whitespace-nowrap font-semibold text-blue-500 duration-200 cursor-pointer py-1 px-3 mx-auto my-[4px] rounded-lg text-[18px] hover:bg-blue-400 hover:text-black relative"
                                >
                                    <PersonRoundedIcon
                                        style={{ marginRight: "10px", top: "-1px", position: "relative" }}
                                    />
                                    <span className="w-full h-full">Main</span>
                                </Link>
                                <div className="w-[calc(100%-8px)] scale_opacity_anim_300_0_origin anim_delay_400 whitespace-nowrap font-semibold text-zinc-500 duration-200 cursor-pointer py-1 px-3 mx-auto my-[4px] rounded-lg text-[18px] hover:bg-zinc-400 hover:text-black">
                                    <SettingsRoundedIcon
                                        style={{ marginRight: "10px", top: "-1px", position: "relative" }}
                                    />
                                    Setting
                                </div>
                                <div
                                    onClick={() => setLogoutConfirmModal(true)}
                                    className="w-[calc(100%-8px)] scale_opacity_anim_300_0_origin anim_delay_500 whitespace-nowrap font-semibold text-red-500 duration-200 cursor-pointer py-1 px-3 mx-auto my-[4px] rounded-lg text-[18px] hover:bg-red-500 hover:text-black"
                                >
                                    <LogoutRoundedIcon
                                        style={{ marginRight: "10px", top: "-1px", position: "relative" }}
                                    />
                                    Log out
                                </div>
                            </>
                        )}
                        <ConfirmModal
                            display={logoutConfirmModal}
                            displayFn={setLogoutConfirmModal}
                            onOkFn={logoutOnClick}
                            title="Log Out"
                            message={`Are you sure you want to log out of ${username}?`}
                            okText="Yes"
                            cancelText="No"
                        />
                    </div>
                </div>
            </>
        );
    }
);

export default Setting;
