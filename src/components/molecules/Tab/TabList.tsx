import React from "react";
import { TabItem } from "@/components/atoms/Tab/TabItem";

interface Tab {
  label: string;
}

interface TabListProps {
  tabs: Tab[];
  activeIndex: number;
  onTabClick: (index: number) => void;
}

export const TabList: React.FC<TabListProps> = ({ tabs, activeIndex, onTabClick }) => {
  return (
    <div className="flex space-x-4 border-b">
      {tabs.map((tab, index) => (
        <TabItem
          key={index}
          label={tab.label}
          isActive={index === activeIndex}
          onClick={() => onTabClick(index)}
        />
      ))}
    </div>
  );
};
