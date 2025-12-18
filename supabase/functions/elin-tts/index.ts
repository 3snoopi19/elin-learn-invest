import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ELIN uses a professional, friendly voice
const ELIN_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - clear, professional female voice

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Voice service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean text for TTS (remove markdown, emojis, etc.)
    const cleanText = text
      .replace(/[*#`_~]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/•/g, '')
      .replace(/📋|📊|📈|💡|🎯|⚠️|🔥|🧠|💳|✅|❌|🌟|👋/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000); // Limit for TTS

    if (!cleanText) {
      return new Response(
        JSON.stringify({ error: 'No speakable text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating TTS for text (${cleanText.length} chars)`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || ELIN_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_turbo_v2_5', // Fast, high-quality model
          output_format: 'mp3_44100_128',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.05, // Slightly faster for natural conversation
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate voice' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(new Uint8Array(audioBuffer));

    console.log('Voice generated successfully, size:', audioBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        success: true,
        audio: base64Audio,
        contentType: 'audio/mpeg'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ELIN TTS error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
