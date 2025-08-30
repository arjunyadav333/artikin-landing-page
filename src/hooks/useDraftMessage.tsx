import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { debounce } from 'lodash-es';

// Hook for managing draft messages with auto-save
export const useDraftMessage = (conversationId?: string) => {
  const [draftText, setDraftText] = useState("");
  const { user } = useAuth();

  // Debounced save function
  const saveDraft = useCallback(
    debounce(async (text: string, convId: string) => {
      if (!user) return;

      try {
        await supabase
          .from('conversation_participants')
          .update({ drafted_text: text || null })
          .eq('conversation_id', convId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, 1000),
    [user]
  );

  // Load existing draft when conversation changes
  useEffect(() => {
    if (!conversationId || !user) {
      setDraftText("");
      return;
    }

    const loadDraft = async () => {
      try {
        const { data } = await supabase
          .from('conversation_participants')
          .select('drafted_text')
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.drafted_text) {
          setDraftText(data.drafted_text);
        } else {
          setDraftText("");
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setDraftText("");
      }
    };

    loadDraft();
  }, [conversationId, user]);

  // Update draft text and auto-save
  const updateDraft = useCallback((text: string) => {
    setDraftText(text);
    
    if (conversationId) {
      saveDraft(text, conversationId);
    }
  }, [conversationId, saveDraft]);

  // Clear draft after sending message
  const clearDraft = useCallback(() => {
    setDraftText("");
    if (conversationId && user) {
      supabase
        .from('conversation_participants')
        .update({ drafted_text: null })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .then(() => {
          console.log('Draft cleared');
        });
    }
  }, [conversationId, user]);

  return {
    draftText,
    updateDraft,
    clearDraft
  };
};