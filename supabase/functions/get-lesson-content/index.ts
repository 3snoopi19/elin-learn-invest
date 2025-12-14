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
    const { lessonId } = await req.json();

    if (!lessonId) {
      return new Response(
        JSON.stringify({ error: 'Lesson ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch lesson with module and course info
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        *,
        module:modules(
          title,
          course:courses(title, topic, level)
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      console.error('Lesson fetch error:', lessonError);
      return new Response(
        JSON.stringify({ error: 'Lesson not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If content already exists, return it
    if (lesson.content_markdown && lesson.is_generated) {
      console.log('Returning cached lesson content');
      return new Response(
        JSON.stringify({ 
          lesson: {
            id: lesson.id,
            title: lesson.title,
            content: lesson.content_markdown,
            content_type: lesson.content_type,
            duration_minutes: lesson.duration_minutes,
            moduleTitle: lesson.module?.title,
            courseTitle: lesson.module?.course?.title
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate content with OpenRouter
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const courseTopic = lesson.module?.course?.topic || 'investing';
    const courseLevel = lesson.module?.course?.level || 'beginner';

    console.log(`Generating content for lesson: ${lesson.title}`);

    const prompt = `You are an expert financial educator creating engaging lesson content. 
Write in a clear, educational style appropriate for ${courseLevel} learners.
Use markdown formatting for structure.
Include practical examples and key takeaways.
Make the content approximately 5 minutes of reading time (800-1200 words).

Create a comprehensive lesson on "${lesson.title}" as part of a ${courseTopic} course.

Structure the lesson with:
1. An engaging introduction
2. Core concepts explained clearly
3. Real-world examples or case studies
4. Key takeaways (3-5 bullet points)
5. A brief summary

Use markdown formatting with headers (##), bold text, bullet points, and blockquotes for important notes.`;

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
    let generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content received from AI');
    }

    // Clean up thinking tags if present
    generatedContent = generatedContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Save the generated content
    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        content_markdown: generatedContent,
        is_generated: true
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Failed to save lesson content:', updateError);
    }

    console.log('Lesson content generated and saved');

    return new Response(
      JSON.stringify({ 
        lesson: {
          id: lesson.id,
          title: lesson.title,
          content: generatedContent,
          content_type: lesson.content_type,
          duration_minutes: lesson.duration_minutes,
          moduleTitle: lesson.module?.title,
          courseTitle: lesson.module?.course?.title
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get lesson content error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
