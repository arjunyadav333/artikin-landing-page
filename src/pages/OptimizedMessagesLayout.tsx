import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { PageSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { 
  useOptimizedConversations,
  useOptimizedRealtimeMessages 
} from "@/hooks/useOptimizedMessaging";

// Lazy load conversation component for better performance
const OptimizedConversationPage = lazy(() => import("./OptimizedConversationPage"));
const ConversationList = lazy(() => import("@/components/messaging/ConversationList"));

const OptimizedMessagesLayout = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useOptimizedConversations();
  
  // Setup real-time updates for the active conversation
  useOptimizedRealtimeMessages(chatId);

  if (!user) {
    return <div>Please log in to access messages.</div>;
  }

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Conversation List Sidebar */}
        <div className="w-1/3 border-r bg-background">
          <Suspense fallback={<PageSpinner />}>
            <ConversationList 
              conversations={conversations}
              isLoading={isLoading}
              currentChatId={chatId}
            />
          </Suspense>
        </div>
        
        {/* Conversation View */}
        <div className="flex-1">
          {chatId ? (
            <Suspense fallback={<PageSpinner />}>
              <OptimizedConversationPage />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default OptimizedMessagesLayout;