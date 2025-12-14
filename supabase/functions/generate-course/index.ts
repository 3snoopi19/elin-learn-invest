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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating course for topic: ${topic}, level: ${level}`);

    // Generate course outline with Gemini via Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are an expert financial education curriculum designer. Generate structured course outlines for investment and finance topics.
            
IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks or extra text.`
          },
          {
            role: 'user',
            content: `Create a comprehensive course outline for "${topic}" at the ${level} level.

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
}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI Response:', content);

    // Parse the JSON response
    let courseOutline;
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      courseOutline = JSON.parse(cleanedContent);
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
