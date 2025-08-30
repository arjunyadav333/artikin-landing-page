import { memo } from "react";
import { cn } from "@/lib/utils";

/**
 * Ultra-fast skeleton component with memoization
 */
const Skeleton = memo(({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
});

Skeleton.displayName = "Skeleton";

/**
 * Optimized post skeleton for ultra-fast loading states
 */
const PostSkeleton = memo(() => (
  <div className="border-b border-border pb-4 mb-4 p-4">
    <div className="flex items-center space-x-3 mb-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-3" />
    <div className="flex space-x-4">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
));

PostSkeleton.displayName = "PostSkeleton";

/**
 * List of optimized post skeletons
 */
const PostListSkeleton = memo(({ count = 3 }: { count?: number }) => (
  <div className="space-y-0">
    {Array.from({ length: count }).map((_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
));

PostListSkeleton.displayName = "PostListSkeleton";

export { Skeleton, PostSkeleton, PostListSkeleton };