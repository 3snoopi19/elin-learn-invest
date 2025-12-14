import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, title, avatarId = 'josh_lite3_20230714' } = await req.json();

    if (!script) {
      return new Response(
        JSON.stringify({ error: 'Script is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    if (!HEYGEN_API_KEY) {
      throw new Error('HEYGEN_API_KEY is not configured');
    }

    console.log(`Generating intro video for: ${title}`);

    // Create video generation task
    const createResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: 'en-US-JennyNeural'
          },
          background: {
            type: 'color',
            value: '#0f172a'
          }
        }],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: '16:9',
        test: true // Use test mode for faster generation
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('HeyGen create error:', errorText);
      throw new Error(`HeyGen API error: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const videoId = createData.data?.video_id;

    if (!videoId) {
      throw new Error('No video ID returned from HeyGen');
    }

    console.log('Video generation started, ID:', videoId);

    // Poll for video completion (max 2 minutes)
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 24; // 24 * 5s = 2 minutes

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
        },
      });

      if (!statusResponse.ok) {
        console.error('Status check failed:', await statusResponse.text());
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Video status (attempt ${attempts}):`, statusData.data?.status);

      if (statusData.data?.status === 'completed') {
        videoUrl = statusData.data.video_url;
      } else if (statusData.data?.status === 'failed') {
        throw new Error('Video generation failed: ' + (statusData.data?.error || 'Unknown error'));
      }
    }

    if (!videoUrl) {
      // Return pending status if not ready yet
      return new Response(
        JSON.stringify({ 
          success: true,
          status: 'processing',
          videoId,
          message: 'Video is still processing. Check back later.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Video generated successfully:', videoUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        status: 'completed',
        videoId,
        videoUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate intro video error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
