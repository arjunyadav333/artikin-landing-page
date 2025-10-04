import React, { memo } from "react";

// Memoized wrapper components to prevent unnecessary re-renders
export const MemoizedSection = memo(({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <section className={className}>{children}</section>;
});

MemoizedSection.displayName = "MemoizedSection";

export const MemoizedDiv = memo(({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={className}>{children}</div>;
});

MemoizedDiv.displayName = "MemoizedDiv";
