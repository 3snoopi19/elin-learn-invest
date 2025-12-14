import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, level = 'beginner' } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log(`Generating course for topic: ${topic}, level: ${level}`);

    const prompt = `You are an expert financial education curriculum designer. Generate structured course outlines for investment and finance topics.
             
IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks or extra text.

Create a comprehensive course outline for "${topic}" at the ${level} level.

The course should have 4-6 modules, each with 3-5 lessons.

Return a JSON object with this exact structure:
{
  "title": "Course title",
  "description": "2-3 sentence course description",
  "estimated_duration": "X weeks",
  "modules": [
    {
      "title": "Module 1 Title",
      "description": "Brief module description",
      "lessons": [
        {
          "title": "Lesson Title",
          "content_type": "article",
          "duration_minutes": 5
        }
      ]
    }
  ]
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'ELIN Investment Navigator',
      },
      body: JSON.stringify({
        model: 'tngtech/deepseek-r1t-chimera:free',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI Response:', content.substring(0, 500));

    // Parse the JSON response
    let courseOutline;
    try {
      // Clean up potential markdown code blocks and thinking tags
      let cleanedContent = content
        .replace(/```json\n?|\n?```/g, '')
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .trim();
      
      // Find JSON object in the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        courseOutline = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      throw new Error('Failed to parse course structure from AI');
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Insert course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: courseOutline.title,
        description: courseOutline.description,
        topic: topic,
        level: level,
        estimated_duration: courseOutline.estimated_duration,
        is_published: true,
        created_by: userId
      })
      .select()
      .single();

    if (courseError) {
      console.error('Course insert error:', courseError);
      throw new Error(`Failed to save course: ${courseError.message}`);
    }

    console.log('Course created:', course.id);

    // Insert modules and lessons
    for (let mi = 0; mi < courseOutline.modules.length; mi++) {
      const moduleData = courseOutline.modules[mi];
      
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .insert({
          course_id: course.id,
          title: moduleData.title,
          description: moduleData.description,
          order_index: mi
        })
        .select()
        .single();

      if (moduleError) {
        console.error('Module insert error:', moduleError);
        continue;
      }

      // Insert lessons for this module
      for (let li = 0; li < moduleData.lessons.length; li++) {
        const lessonData = moduleData.lessons[li];
        
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: module.id,
            title: lessonData.title,
            content_type: lessonData.content_type || 'article',
            duration_minutes: lessonData.duration_minutes || 5,
            order_index: li,
            is_generated: false
          });

        if (lessonError) {
          console.error('Lesson insert error:', lessonError);
        }
      }
    }

    console.log('Course generation complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        courseId: course.id,
        title: course.title 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate course error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
