import React from "react";

interface HeaderTitlePageProps {
  title: string;
  description?: string;
}

const HeaderTitlePage: React.FC<HeaderTitlePageProps> = ({
  title,
  description,
}) => (
  <div>
    <h1 className="text-2xl font-bold mb-2 !font-sentient text-[#151515] dark:text-[#E5E7EB]">
      {title}
    </h1>
    {description && <p className="text-sm text-[#A3AED0] m-0 dark:text-white/60">{description}</p>}
  </div>
);

export default HeaderTitlePage;
