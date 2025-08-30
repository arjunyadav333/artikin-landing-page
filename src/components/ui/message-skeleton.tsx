import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton({ isOwnMessage = false }: { isOwnMessage?: boolean }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-xs ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwnMessage && (
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        )}
        <div className={`rounded-lg p-3 ${isOwnMessage ? 'bg-primary/10' : 'bg-muted'}`}>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function MessageListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} isOwnMessage={i % 3 === 0} />
      ))}
    </div>
  );
}