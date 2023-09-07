import React, { Dispatch, SetStateAction } from "react";

const Search = ({
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
    return (
        <div
            id="search"
            className={`bg-black w-full ${
                searchState ? "h-full" : "h-0"
            } duration-300 overflow-hidden`}
        >
            <div className="flex flex-row w-[calc(100%-36px)] h-[40px] relative ml-[18px] mt-[14px]">
                <input
                    type="text"
                    name=""
                    id="search-input"
                    className="bg-black border-[1px] border-borders flex-grow text-[14px] rounded-full pl-3 py-1 outline-none h-full"
                    autoComplete="off"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search users"
                />
                <button
                    id="search-button"
                    className="border-[1px] border-borders active:bg-white active:text-black duration-100 cursor-pointer rounded-full w-[40px] h-full relative ml-[10px]"
                    onClick={searchOnClick}
                >
                    <i className="bi bi-search absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                </button>
            </div>
            <div className="ml-[18px] mt-[14px] w-[calc(100%-36px)] h-[calc(100%-80px)] overflow-y-scroll">
                {searchResult &&
                    searchResult.users.length !== 0 &&
                    searchResult.users.map((elem) => (
                        <div
                            className="h-[60px] flex flex-row w-[100%] hover:bg-slate-300 border-borders group cursor-pointer duration-200 overflow-hidden"
                            onClick={() => userOnClick(elem.username)}
                        >
                            <div className="h-3/4 my-[7px] mr-[7px] ml-[18px] aspect-square rounded-full bg-slate-800"></div>
                            <div className="flex flex-col">
                                <div className="text-[18px] mt-[14px] ml-[10px] group-hover:text-black duration-200">
                                    {elem.username}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Search;
