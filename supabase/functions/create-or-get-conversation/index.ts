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

    const { otherUserId } = await req.json();

    if (!otherUserId) {
      throw new Error('otherUserId is required');
    }

    console.log(`Creating/getting conversation between ${user.id} and ${otherUserId}`);

    // Check if conversation already exists (bidirectional)
    const { data: existingConversation, error: checkError } = await supabaseClient
      .from('conversations')
      .select('id')
      .or(`and(participant_a.eq.${user.id},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${user.id})`)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
      throw checkError;
    }

    if (existingConversation) {
      console.log('Found existing conversation:', existingConversation.id);
      return new Response(
        JSON.stringify({ conversationId: existingConversation.id, created: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabaseClient
      .from('conversations')
      .insert({
        participant_a: user.id,
        participant_b: otherUserId
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      throw createError;
    }

    console.log('Created new conversation:', newConversation.id);

    // Create participant records for both users
    const { error: participantError } = await supabaseClient
      .from('conversation_participants')
      .insert([
        {
          conversation_id: newConversation.id,
          user_id: user.id
        },
        {
          conversation_id: newConversation.id,
          user_id: otherUserId
        }
      ]);

    if (participantError) {
      console.error('Error creating participant records:', participantError);
      // Don't throw here as the conversation is already created
    }

    return new Response(
      JSON.stringify({ conversationId: newConversation.id, created: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-or-get-conversation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});