import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const PostSkeleton = () => {
  return (
    <Card className="border-b border-border rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </Card>
  );
};

export const PostListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
};