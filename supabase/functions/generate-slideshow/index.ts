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
    const { courseTitle, courseDescription } = await req.json();
    
    if (!courseTitle) {
      return new Response(
        JSON.stringify({ error: 'Course title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating slideshow for:', courseTitle);

    // Use Lovable AI with tool calling for structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate engaging slideshow content for financial education courses.'
          },
          {
            role: 'user',
            content: `Create 5 educational slides for a course introduction about "${courseTitle}". ${courseDescription ? `Course description: ${courseDescription}` : ''}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_slideshow',
              description: 'Create an educational slideshow with 5 slides',
              parameters: {
                type: 'object',
                properties: {
                  slides: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { 
                          type: 'string',
                          description: 'Short, engaging slide title (max 6 words)'
                        },
                        bulletPoints: { 
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Exactly 3 bullet points, each 10-20 words'
                        },
                        icon: { 
                          type: 'string',
                          enum: ['BookOpen', 'TrendingUp', 'DollarSign', 'PieChart', 'BarChart3', 'Wallet', 'Target', 'Shield', 'Lightbulb', 'CheckCircle', 'AlertCircle', 'Info', 'Star'],
                          description: 'Icon name for the slide'
                        }
                      },
                      required: ['title', 'bulletPoints', 'icon'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['slides'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_slideshow' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract slides from tool call response
    let slides = [];
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        slides = args.slides || [];
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e);
      }
    }

    // Fallback if no slides generated
    if (!slides.length) {
      console.log('Using fallback slides');
      slides = [
        {
          title: `Welcome to ${courseTitle}`,
          bulletPoints: [
            "Learn essential concepts to master this topic",
            "Practical examples and real-world applications", 
            "Build your knowledge step by step"
          ],
          icon: "BookOpen"
        },
        {
          title: "Key Concepts",
          bulletPoints: [
            "Understanding the fundamentals is crucial for success",
            "We'll break down complex ideas into simple terms",
            "Each lesson builds on the previous one"
          ],
          icon: "Lightbulb"
        },
        {
          title: "What You'll Learn",
          bulletPoints: [
            "Core principles and terminology you need to know",
            "Practical strategies you can apply immediately",
            "Common pitfalls and how to avoid them"
          ],
          icon: "Target"
        },
        {
          title: "Your Learning Journey",
          bulletPoints: [
            "Interactive lessons with audio explanations",
            "Progress tracking to monitor your advancement",
            "Quizzes to test your understanding"
          ],
          icon: "TrendingUp"
        },
        {
          title: "Let's Get Started!",
          bulletPoints: [
            "Take your time with each lesson for best results",
            "Review concepts as needed to reinforce learning",
            "Ready to begin your educational journey?"
          ],
          icon: "Star"
        }
      ];
    }

    console.log('Returning slides:', slides.length);

    return new Response(
      JSON.stringify({ slides }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating slideshow:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate slideshow' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
