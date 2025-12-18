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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to your Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI Response:', content.substring(0, 500));

    // Parse the JSON response with robust error handling
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
        let jsonStr = jsonMatch[0];
        
        // Try to fix common JSON issues
        // Fix missing closing braces in objects within arrays
        jsonStr = jsonStr.replace(/(\d+)\s*\n\s*,\s*\{/g, '$1\n        },\n        {');
        // Fix trailing commas
        jsonStr = jsonStr.replace(/,(\s*[\]}])/g, '$1');
        
        courseOutline = JSON.parse(jsonStr);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      
      // Return a fallback course structure
      console.log('Using fallback course structure');
      courseOutline = {
        title: `Introduction to ${topic}`,
        description: `A comprehensive ${level} course on ${topic} designed to build your foundational knowledge.`,
        estimated_duration: "4 weeks",
        modules: [
          {
            title: "Getting Started",
            description: "Introduction and foundational concepts",
            lessons: [
              { title: "What You'll Learn", content_type: "article", duration_minutes: 5 },
              { title: "Key Terminology", content_type: "article", duration_minutes: 10 },
              { title: "Why This Matters", content_type: "article", duration_minutes: 8 }
            ]
          },
          {
            title: "Core Concepts",
            description: "Understanding the fundamentals",
            lessons: [
              { title: "Basic Principles", content_type: "article", duration_minutes: 12 },
              { title: "How It Works", content_type: "article", duration_minutes: 10 },
              { title: "Common Strategies", content_type: "article", duration_minutes: 15 }
            ]
          },
          {
            title: "Practical Application",
            description: "Putting knowledge into practice",
            lessons: [
              { title: "Getting Started Safely", content_type: "article", duration_minutes: 10 },
              { title: "Best Practices", content_type: "article", duration_minutes: 12 },
              { title: "Next Steps", content_type: "article", duration_minutes: 8 }
            ]
          }
        ]
      };
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
