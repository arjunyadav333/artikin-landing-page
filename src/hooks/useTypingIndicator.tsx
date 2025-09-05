import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeManager } from '@/lib/RealtimeManager';
import { useAuth } from './useAuth';

interface TypingUser {
  user_id: string;
  username?: string;
  display_name?: string;
}

/**
 * Hook for managing typing indicators in conversations
 */
export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  // Subscribe to typing updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = realtimeManager.subscribeToTyping(
      conversationId,
      (users) => {
        // Filter out current user from typing list
        const otherUsers = users.filter(u => u.user_id !== user?.id);
        setTypingUsers(otherUsers);
      }
    );

    return unsubscribe;
  }, [conversationId, user?.id]);

  // Send typing status with debouncing
  const sendTypingStatus = useCallback((isTyping: boolean = true) => {
    if (!user || !conversationId) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping && !isTypingRef.current) {
      // Start typing
      isTypingRef.current = true;
      realtimeManager.sendTypingStatus(conversationId, true, {
        username: user.user_metadata?.username,
        display_name: user.user_metadata?.display_name || user.email
      });

      console.log('⌨️ Started typing');
    }

    if (isTyping) {
      // Reset stop-typing timeout
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        realtimeManager.sendTypingStatus(conversationId, false);
        console.log('⌨️ Stopped typing (timeout)');
      }, 1000); // Stop typing after 1 second of inactivity
    } else {
      // Explicitly stop typing
      isTypingRef.current = false;
      realtimeManager.sendTypingStatus(conversationId, false);
      console.log('⌨️ Stopped typing (explicit)');
    }
  }, [conversationId, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing when component unmounts
      if (isTypingRef.current) {
        sendTypingStatus(false);
      }
    };
  }, [sendTypingStatus]);

  return {
    typingUsers,
    sendTypingStatus
  };
};