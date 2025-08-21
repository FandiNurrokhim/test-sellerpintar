import React, { useState } from "react";
import { TabList } from "@/components/molecules/Tab/TabList";

interface TabGroupProps {
  tabs: { label: string }[];
  children: React.ReactNode[];
}

export const TabGroup: React.FC<TabGroupProps> = ({ tabs, children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <TabList tabs={tabs} activeIndex={activeTab} onTabClick={setActiveTab} />
      <div className="mt-4">{children[activeTab]}</div>
    </div>
  );
};
