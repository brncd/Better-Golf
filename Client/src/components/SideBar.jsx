import { Listbox,  ListboxSection,  ListboxItem } from "@nextui-org/react";
import React from "react";
import { IconWrapper } from "../components/IconWrapper"
import { ItemCounter } from "../components/ItemCounter";
import { TrophyIcon } from "../assets/TrophyIcon";
import { UserIcon } from "../assets/UserIcon";
import { ResultsIcon } from "../assets/ResultsIcon";
import { Link, useNavigate } from "react-router-dom";
import { CoursesIcon } from "../assets/CoursesIcon";
import { SunIcon } from "../assets/SunIcon";
import { PlayerIcon } from "../assets/PlayerIcon";
import { CategoryIcon } from "../assets/CategoryIcon";


export function SideBar() {
  const navigate = useNavigate();
  return (
    <div className="flex bg-zinc-300 dark:bg-zinc-900 dark:text-slate-200 rounded-none">
      <Listbox
        aria-label="SideBar"
        className="h-screen pl-2 pb-6 pt-2 gap-4 divide-y divide-default-300/50 dark:divide-default-100/80 max-w-[400px] overflow-visible shadow-sm dark:shadow-gray-800"
        itemClasses={{
          base: "px-3 rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80",
        }}
      >
        <ListboxItem 
          onClick={() => {
            navigate("/tournaments");
          }}
          key="Tournaments"
          /* endContent={<ItemCounter number={13} />} */
          startContent={
            <IconWrapper className="bg-success/10 text-success ">
              <TrophyIcon className=" text-lg  sm:text-4xl " />
            </IconWrapper>
          }
       className=" gap-5 " >
          Tournaments
        </ListboxItem>
        <ListboxItem
          onClick={() => {
            navigate("/players");
          }}
          key="Players"
          /* endContent={<ItemCounter number={13} />} */
          startContent={
            <IconWrapper className="bg-success/10 text-success ">
              <PlayerIcon className="text-xs  sm:text-4xl " />
            </IconWrapper>
          }
          className="gap-5"
        >
          Players
        </ListboxItem>
        <ListboxItem
          onClick={() => {
            navigate("/courses");
          }}
          key="Courses"
          /* endContent={<ItemCounter number={13} />} */
          startContent={
            <IconWrapper className="bg-success/10 text-success">
              <CoursesIcon className="text-4xl" />
            </IconWrapper>
          }
          className="gap-5"
          >
          Courses
        </ListboxItem>
        <ListboxItem
          onClick={() => {
            navigate("/categories/1");
          }}
          key="Categories"
          /* endContent={<ItemCounter number={13} />} */
          startContent={
            <IconWrapper className="bg-success/10 text-success">
              <CategoryIcon className="text-lg sm:text-4xl " />
            </IconWrapper>
          }
          className="gap-5"
          >
          Categories
        </ListboxItem>
      </Listbox>
    </div>
  );
}
