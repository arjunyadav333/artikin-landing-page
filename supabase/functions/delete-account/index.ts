import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabase.auth.getUser(token)
    const user = data.user

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { userId } = await req.json()

    // Verify user can only delete their own account
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Can only delete your own account' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Initiating account deletion for user: ${userId}`)

    // Delete user data in cascading order
    
    // 1. Delete from follows table (both as follower and followed)
    await supabase.from('follows').delete().eq('follower_id', userId)
    await supabase.from('follows').delete().eq('followed_id', userId)
    
    // 2. Delete likes
    await supabase.from('likes').delete().eq('user_id', userId)
    
    // 3. Delete comments
    await supabase.from('comments').delete().eq('user_id', userId)
    
    // 4. Delete shares
    await supabase.from('shares').delete().eq('user_id', userId)
    
    // 5. Delete opportunity applications
    await supabase.from('opportunity_applications').delete().eq('user_id', userId)
    
    // 6. Delete opportunities
    await supabase.from('opportunities').delete().eq('user_id', userId)
    
    // 7. Delete posts
    await supabase.from('posts').delete().eq('user_id', userId)
    
    // 8. Delete message attachments for user's messages
    const { data: userMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', userId)
    
    if (userMessages && userMessages.length > 0) {
      const messageIds = userMessages.map(m => m.id)
      await supabase.from('message_attachments').delete().in('message_id', messageIds)
    }
    
    // 9. Delete messages and receipts
    await supabase.from('message_receipts').delete().eq('user_id', userId)
    await supabase.from('messages').delete().eq('sender_id', userId)
    
    // 10. Delete conversation participants
    await supabase.from('conversation_participants').delete().eq('user_id', userId)
    
    // 11. Delete conversations where user is a participant
    await supabase.from('conversations').delete().eq('participant_a', userId)
    await supabase.from('conversations').delete().eq('participant_b', userId)
    
    // 12. Delete user blocks
    await supabase.from('user_blocks').delete().eq('blocker_id', userId)
    await supabase.from('user_blocks').delete().eq('blocked_id', userId)
    
    // 13. Delete starred messages
    await supabase.from('starred_messages').delete().eq('user_id', userId)
    
    // 14. Delete profile
    await supabase.from('profiles').delete().eq('user_id', userId)
    
    // 15. Finally delete the auth user (this should cascade to any remaining references)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account', details: deleteUserError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully deleted account for user: ${userId}`)

    return new Response(
      JSON.stringify({ 
        message: 'Account successfully deleted',
        userId: userId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in delete-account function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})