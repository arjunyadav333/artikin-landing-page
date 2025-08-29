import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { conversationId, upToMessageId } = await req.json();

    if (!conversationId || !upToMessageId) {
      throw new Error('conversationId and upToMessageId are required');
    }

    console.log(`Marking messages as read for user ${user.id} in conversation ${conversationId} up to message ${upToMessageId}`);

    // Verify user is participant in conversation
    const { data: participant, error: participantError } = await supabaseClient
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (participantError || !participant) {
      throw new Error('User is not a participant in this conversation');
    }

    // Get the timestamp of the target message
    const { data: targetMessage, error: messageError } = await supabaseClient
      .from('messages')
      .select('created_at')
      .eq('id', upToMessageId)
      .eq('conversation_id', conversationId)
      .single();

    if (messageError || !targetMessage) {
      throw new Error('Message not found');
    }

    // Get all messages in conversation up to and including the target message
    // that are not sent by the current user
    const { data: messagesToMark, error: messagesError } = await supabaseClient
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .lte('created_at', targetMessage.created_at)
      .neq('sender_id', user.id);

    if (messagesError) {
      console.error('Error fetching messages to mark:', messagesError);
      throw messagesError;
    }

    console.log(`Found ${messagesToMark.length} messages to mark as read`);

    if (messagesToMark.length > 0) {
      // Create or update message receipts for all these messages
      const receipts = messagesToMark.map(msg => ({
        message_id: msg.id,
        user_id: user.id,
        status: 'read'
      }));

      const { error: receiptError } = await supabaseClient
        .from('message_receipts')
        .upsert(receipts, { 
          onConflict: 'message_id,user_id',
          ignoreDuplicates: false 
        });

      if (receiptError) {
        console.error('Error creating receipts:', receiptError);
        throw receiptError;
      }

      // Also create delivered receipts for messages that don't have any receipt yet
      const deliveredReceipts = messagesToMark.map(msg => ({
        message_id: msg.id,
        user_id: user.id,
        status: 'delivered'
      }));

      // This will be ignored if read receipt already exists due to upsert
      await supabaseClient
        .from('message_receipts')
        .upsert(deliveredReceipts, { 
          onConflict: 'message_id,user_id',
          ignoreDuplicates: true 
        });
    }

    // Update participant's last_read_message_id
    const { error: updateError } = await supabaseClient
      .from('conversation_participants')
      .update({ last_read_message_id: upToMessageId })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating last read message:', updateError);
      throw updateError;
    }

    console.log(`Successfully marked ${messagesToMark.length} messages as read`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        markedCount: messagesToMark.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mark-messages-read function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});