import React, { Dispatch, SetStateAction, memo, useMemo } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const Search = memo(
    ({
        searchState,
        searchInput,
        setSearchInput,
        searchOnClick,
        searchResult,
        userOnClick,
    }: {
        searchState: boolean;
        searchInput: string;
        setSearchInput: Dispatch<SetStateAction<string>>;
        searchOnClick: () => void;
        searchResult: SearchResult | undefined;
        userOnClick: (username: string) => void;
    }) => {
        const iconStyle = useMemo(() => ({ width: "27px", height: "27px" }), []);

        return (
            <div
                id="search"
                className={`bg-black w-full ${searchState ? "h-full" : "h-0"} duration-300 overflow-hidden`}
            >
                <div className="flex flex-row w-[calc(100%-36px)] h-[40px] relative ml-[18px] mt-[14px]">
                    <div className="flex-grow bg-zinc-900 border-zinc-800 border-[1px] h-full rounded-full pl-4 pr-11 ">
                        <textarea
                            id="search-input"
                            className="resize-none placeholder:text-zinc-500 bg-zinc-900 text-[14px] outline-none py-[8px] h-full w-full"
                            autoComplete="off"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search users"
                        />
                    </div>
                    <button
                        id="search-button"
                        className="border-[1px] border-zinc-800 bg-zinc-900 text-zinc-600 active:bg-white active:text-black duration-100 cursor-pointer rounded-full w-[40px] h-full relative ml-[10px]"
                        onClick={searchOnClick}
                    >
                        <SearchRoundedIcon style={iconStyle} />
                    </button>
                </div>
                <div className="ml-[18px] mt-[14px] w-[calc(100%-36px)] h-[calc(100%-80px)] rounded-xl border border-zinc-800 bg-zinc-900 overflow-y-scroll">
                    {searchResult &&
                        searchResult.users.length !== 0 &&
                        searchResult.users.map((elem) => (
                            <div
                                className="h-[60px] flex flex-row w-[calc(100%-8px)] mx-auto my-[4px] hover:bg-zinc-400 rounded-lg bg-black border-borders group cursor-pointer duration-200 overflow-hidden"
                                onClick={() => userOnClick(elem.username)}
                            >
                                <div className="h-3/4 my-[7px] mr-[7px] ml-[18px] aspect-square rounded-full bg-zinc-800"></div>
                                <div className="flex flex-col">
                                    <div className="text-[18px] font-semibold mt-[14px] ml-[10px] group-hover:text-black duration-200">
                                        {elem.username}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        );
    }
);

export default Search;
