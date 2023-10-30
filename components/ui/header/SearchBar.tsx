// SearchBar.js
"use client";

import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { FC, useEffect, useRef, useState } from "react";
import Button from "../button/Button";
import { usePathname, useRouter } from "next/navigation";
import { CSSTransition } from "react-transition-group";
import H3 from "../text/H3";
import { BASE_URL } from "@/utils/utils";
import { Community, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import Avatar from "../Avatar";

interface searchResult {
  community?: (Community & { userCount: number })[];
  user?: User[];
}

const SearchBar: FC = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [searchResult, setSearchResult] = useState<null | searchResult>(null);

  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathName = usePathname();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchResult(null);
    setQuery(e.target.value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(
      setTimeout(() => {
        handleSearch(e.target.value);
      }, 300),
    );
  };

  const handleSearch = async (term: string) => {
    try {
      const res = await fetch(`/api/search?term=${term}`);
      const data = await res.json();
      setSearchResult({ community: data.community, user: data.user });
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      ref.current &&
      !ref.current.contains(e.target as Node) &&
      e.target !== document.getElementById("searchbar")
    ) {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isSearching) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isSearching]);

  return (
    <div className="left-0 right-0 laptop:absolute laptop:m-auto laptop:w-fit">
      <div className="heading brutalism-border relative   z-[70] flex  h-fit gap-extra-small rounded-large border-primary80 bg-neutral1  p-extra-small dark:border-primary1 dark:bg-primary80 ">
        <Button className="dark:text-primary1">
          <Icon path={mdiMagnify} size={2}></Icon>
        </Button>
        <input
          id="searchbar"
          onClick={() => setIsSearching(true)}
          className="body relative z-[70] w-full bg-neutral1 focus:outline-none dark:bg-primary80 dark:text-primary1 laptop:w-[600px] "
          type="text"
          placeholder="Search in Roddat"
          value={query}
          onChange={handleInputChange}
          onKeyUp={handleKeyPress}
        />
      </div>
      <CSSTransition
        in={isSearching}
        timeout={400}
        classNames="fade"
        unmountOnExit
        nodeRef={ref}
      >
        <div
          ref={ref}
          className="brutalism-border absolute top-12 z-50 flex w-full cursor-pointer flex-col gap-small rounded-b-sub-large border-primary80 bg-white pb-small  pt-sub-large text-body font-medium text-primary90 dark:border-primary1 dark:bg-primary80  dark:text-primary1 "
        >
          {searchResult?.community && searchResult?.community.length > 0 ? (
            <>
              <div className="flex flex-col gap-small pl-medium">
                <H3 className="body font-bold">Communities</H3>
                {searchResult.community.map((community) => {
                  return (
                    <div
                      key={uuidv4()}
                      className="flex items-center gap-extra-small"
                    >
                      <Avatar
                        alt={`${community.name} picture`}
                        src={
                          community.picture
                            ? community.picture
                            : "http://dummyimage.com/912x809.png/dddddd/000000"
                        }
                        size={3}
                        className="mt-[7px] h-[30px] rounded-full"
                      ></Avatar>

                      <div className="flex flex-col items-start">
                        <p>r/{community.name}</p>
                        <caption className="caption">
                          Community with {community.userCount}{" "}
                          {community.userCount > 1 ? "members" : "member"}
                        </caption>
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr className="w-full border border-primary80 opacity-20 dark:border-primary10"></hr>
            </>
          ) : null}

          {searchResult?.user && searchResult?.user.length > 0 ? (
            <>
              <div className="flex flex-col gap-small pl-medium">
                <H3 className="body font-bold">User</H3>
                {searchResult.user.map((user) => {
                  return (
                    <div
                      key={uuidv4()}
                      className="flex items-center gap-extra-small"
                    >
                      <Avatar
                        alt={`${user.name} picture`}
                        src={
                          user.image
                            ? user.image
                            : "http://dummyimage.com/912x809.png/dddddd/000000"
                        }
                        size={3}
                        className="mt-[7px] h-[30px] rounded-full"
                      ></Avatar>

                      <div className="flex flex-col items-start">
                        <p>r/{user.name}</p>
                        <caption className="caption">User</caption>
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr className="w-full border border-primary80 opacity-20 dark:border-primary10"></hr>
            </>
          ) : null}

          {query && (
            <div className="flex gap-extra-small pl-medium">
              <Icon path={mdiMagnify} size={1.4}></Icon>
              <H3 type="body">Search for {query}</H3>
            </div>
          )}
        </div>
      </CSSTransition>
    </div>
  );
};

export default SearchBar;
