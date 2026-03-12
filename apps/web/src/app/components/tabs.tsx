"use client";

import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import Image from "next/image";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";

import { TABS_ELEMENTS } from "../constants";

type TabEntry = (typeof TABS_ELEMENTS)[number];

export const Tabs = () => {
  const [activeTab, setActiveTab] = useState<TabEntry>(TABS_ELEMENTS[0]);

  const handleTabClick = (tab: TabEntry) => setActiveTab(tab);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 rounded-md border p-4">
      <div className="flex w-full items-center justify-between gap-3 overflow-x-scroll rounded-md border p-2">
        {TABS_ELEMENTS.map((entry) => (
          <Button
            key={entry.tab}
            className={cn(
              "px-8 py-2 text-xl",
              entry.tab !== activeTab.tab &&
                "hover:text-accent-foreground hover:bg-transparent dark:hover:bg-transparent",
              entry.tab === activeTab.tab && "rounded-2xl",
            )}
            variant={entry.tab === activeTab.tab ? "secondary" : "ghost"}
            onClick={() => handleTabClick(entry)}
          >
            {entry.tab}
          </Button>
        ))}
      </div>

      <p className="w-1/2 text-center text-lg max-sm:w-full max-sm:text-start">
        {activeTab.description}
      </p>

      <Zoom wrapElement="span" canSwipeToUnzoom={true}>
        <Image
          src={activeTab.imageSrc}
          alt={activeTab.imageAlt}
          width={600}
          height={100}
          loading="lazy"
          className="w-full cursor-zoom-in place-self-center rounded-md border"
        />
      </Zoom>
    </div>
  );
};
