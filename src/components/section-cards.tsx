import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { StatCard } from "@/components/ui/stat-card";

const cards = [
  {
    icon: <IconTrendingUp className="size-6 text-primary" />,
    title: "Spent this month",
    value: "$682.5",
    description: "Total Revenue",
    badgeText: "+12.5%",
    badgeIcon: <IconTrendingUp />,
    variant: "outline" as const,
    footer: (
      <>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Visitors for the last 6 months
        </div>
      </>
    ),
  },
  {
    icon: <IconTrendingDown className="size-6 text-primary" />,
    title: "Earnings",
    value: "$350.40",
    description: "New Customers",
    badgeText: "-20%",
    badgeIcon: <IconTrendingDown />,
    variant: "outline" as const,
    footer: (
      <>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Down 20% this period <IconTrendingDown className="size-4" />
        </div>
        <div className="text-muted-foreground">Acquisition needs attention</div>
      </>
    ),
  },
  {
    icon: <IconTrendingUp className="size-6 text-primary" />,
    title: "New Clients",
    value: "321",
    description: "Active Accounts",
    badgeText: "+12.5%",
    badgeIcon: <IconTrendingUp />,
    variant: "outline" as const,
    footer: (
      <>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Strong user retention <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">Engagement exceed targets</div>
      </>
    ),
  },
  {
    icon: <IconTrendingUp className="size-6 text-primary" />,
    title: "Activity",
    value: "$540.40",
    description: "Growth Rate",
    badgeText: "+4.5%",
    badgeIcon: <IconTrendingUp />,
    variant: "fill" as const,
    footer: (
      <>
        <div className="line-clamp-1 flex gap-2 font-medium">
          Steady performance increase <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">Meets growth projections</div>
      </>
    ),
  },
];

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} />
      ))}
    </div>
  );
}
