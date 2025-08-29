import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Time window in minutes for deleting messages for everyone
const DELETE_TIME_WINDOW_MINUTES = 60;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authorization');
    }

    const { messageId } = await req.json();

    if (!messageId) {
      throw new Error('messageId is required');
    }

    console.log(`Attempting to delete message ${messageId} for everyone by user ${user.id}`);

    // Get the message and verify ownership
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .select('id, sender_id, created_at, conversation_id, deleted_for_everyone')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      throw new Error('Message not found');
    }

    // Check if user is the sender
    if (message.sender_id !== user.id) {
      throw new Error('Only the sender can delete a message for everyone');
    }

    // Check if message is already deleted
    if (message.deleted_for_everyone) {
      throw new Error('Message is already deleted for everyone');
    }

    // Check time window
    const messageTime = new Date(message.created_at);
    const now = new Date();
    const diffInMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);

    if (diffInMinutes > DELETE_TIME_WINDOW_MINUTES) {
      throw new Error(`Messages can only be deleted for everyone within ${DELETE_TIME_WINDOW_MINUTES} minutes of sending`);
    }

    console.log(`Message is ${diffInMinutes.toFixed(1)} minutes old, within ${DELETE_TIME_WINDOW_MINUTES} minute limit`);

    // Mark message as deleted for everyone
    const { error: deleteError } = await supabaseClient
      .from('messages')
      .update({ 
        deleted_for_everyone: true,
        body: null // Clear the message content
      })
      .eq('id', messageId);

    if (deleteError) {
      console.error('Error deleting message:', deleteError);
      throw deleteError;
    }

    // If this was the last message in the conversation, we might need to update the conversation's last_message_id
    // Get the conversation's current last message
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select('last_message_id')
      .eq('id', message.conversation_id)
      .single();

    if (convError) {
      console.error('Error fetching conversation:', convError);
    } else if (conversation && conversation.last_message_id === messageId) {
      // This was the last message, find the previous non-deleted message
      const { data: previousMessage, error: prevError } = await supabaseClient
        .from('messages')
        .select('id')
        .eq('conversation_id', message.conversation_id)
        .eq('deleted_for_everyone', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevError) {
        console.error('Error fetching previous message:', prevError);
      } else {
        // Update conversation's last message (could be null if no messages left)
        await supabaseClient
          .from('conversations')
          .update({ last_message_id: previousMessage?.id || null })
          .eq('id', message.conversation_id);
      }
    }

    console.log(`Successfully deleted message ${messageId} for everyone`);

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: messageId,
        timeWindowMinutes: DELETE_TIME_WINDOW_MINUTES
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-message-for-everyone function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timeWindowMinutes: DELETE_TIME_WINDOW_MINUTES
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});