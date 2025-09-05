import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key for server operations
const supabaseServiceRole = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle WebSocket upgrade for real-time messaging
  if (upgradeHeader.toLowerCase() === "websocket") {
    return handleWebSocket(req);
  }

  // Handle regular HTTP POST for fallback
  if (req.method === 'POST') {
    return handleHTTPMessage(req);
  }

  return new Response("Method not allowed", { 
    status: 405, 
    headers: corsHeaders 
  });
});

async function handleWebSocket(req: Request) {
  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log("Fast ACK WebSocket connection opened");
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        
        if (data.type === 'fast_message') {
          await handleFastMessage(data, socket);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        
        // Send error response
        const errorResponse = {
          type: 'error',
          client_id: data?.client_id || 'unknown',
          error: error.message || 'Unknown error'
        };
        
        try {
          socket.send(JSON.stringify(errorResponse));
        } catch (sendError) {
          console.error('Error sending error response:', sendError);
        }
      }
    };

    socket.onclose = () => {
      console.log("Fast ACK WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return response;
  } catch (error) {
    console.error('Error upgrading to WebSocket:', error);
    return new Response("WebSocket upgrade failed", { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}

async function handleHTTPMessage(req: Request) {
  try {
    const data = await req.json();
    console.log('Received HTTP message:', data);
    
    const result = await createMessageInDatabase(data);
    
    return new Response(JSON.stringify({
      success: true,
      server_id: result.id,
      server_timestamp: result.server_timestamp,
      client_id: data.client_id
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  } catch (error) {
    console.error('Error handling HTTP message:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
}

async function handleFastMessage(data: any, socket: WebSocket) {
  try {
    console.log('Processing fast message:', data);
    
    // Validate required fields
    if (!data.client_id || !data.conversation_id || !data.sender_id) {
      throw new Error('Missing required fields');
    }

    // Send immediate ACK (before database write for speed)
    const ackResponse = {
      type: 'ack',
      client_id: data.client_id,
      ack_timestamp: new Date().toISOString(),
      status: 'received'
    };
    
    socket.send(JSON.stringify(ackResponse));
    console.log('Sent immediate ACK for client_id:', data.client_id);

    // Create message in database (async, after ACK)
    try {
      const result = await createMessageInDatabase(data);
      
      // Send final confirmation with server details
      const confirmResponse = {
        type: 'confirmed',
        client_id: data.client_id,
        server_id: result.id,
        server_timestamp: result.server_timestamp,
        status: 'persisted'
      };
      
      socket.send(JSON.stringify(confirmResponse));
      console.log('Sent confirmation for client_id:', data.client_id);
      
    } catch (dbError) {
      console.error('Database error after ACK:', dbError);
      
      // Send error notification (message was ACKed but failed to persist)
      const errorResponse = {
        type: 'error',
        client_id: data.client_id,
        error: 'Failed to persist message',
        details: dbError.message
      };
      
      socket.send(JSON.stringify(errorResponse));
    }
    
  } catch (error) {
    console.error('Error in handleFastMessage:', error);
    
    const errorResponse = {
      type: 'error',
      client_id: data.client_id || 'unknown',
      error: error.message || 'Unknown error'
    };
    
    try {
      socket.send(JSON.stringify(errorResponse));
    } catch (sendError) {
      console.error('Error sending error response:', sendError);
    }
  }
}

async function createMessageInDatabase(data: any) {
  console.log('Creating message in database:', data);
  
  // Use the database function for atomic message creation
  const { data: result, error } = await supabaseServiceRole
    .rpc('create_message_with_client_id', {
      conversation_id_param: data.conversation_id,
      sender_id_param: data.sender_id,
      client_id_param: data.client_id,
      kind_param: data.kind || 'text',
      body_param: data.content || data.body
    });

  if (error) {
    console.error('Database error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!result || result.length === 0) {
    throw new Error('No message created');
  }

  console.log('Message created successfully:', result[0]);
  return result[0];
}