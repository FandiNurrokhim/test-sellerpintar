import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Badge: React.FC<BadgeProps> = ({ children, className, ...props }) => (
  <span
    className={`inline-block rounded-xl bg-blue-200 text-blue-900 px-4 py-1 text-sm font-normal ${className ?? ""}`}
    {...props}
  >
    {children}
  </span>
);