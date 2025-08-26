import { supabase } from '@/integrations/supabase/client';

export const createSampleData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if sample data already exists
    const { data: existingPosts } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (existingPosts && existingPosts.length > 0) {
      return false; // Sample data already exists
    }

    // Create sample posts
    const samplePosts = [
      {
        title: "Welcome to our platform!",
        content: "This is a sample post to help you see how the feed works. You can create your own posts by clicking the Create button! #welcome #sample",
        media_type: "text",
        user_id: user.id,
        likes_count: 12,
        comments_count: 3,
        shares_count: 1
      },
      {
        content: "Just finished an amazing performance at the local theater! The energy from the audience was incredible 🎭 #theater #performance #acting",
        media_type: "text",
        user_id: user.id,
        likes_count: 24,
        comments_count: 8,
        shares_count: 4
      },
      {
        title: "Behind the Scenes",
        content: "Here's what goes into preparing for a big show. Hours of rehearsal, costume fittings, and teamwork make it all come together! #behindthescenes #teamwork",
        media_type: "text",
        user_id: user.id,
        likes_count: 18,
        comments_count: 5,
        shares_count: 2
      }
    ];

    const { data, error } = await supabase
      .from('posts')
      .insert(samplePosts)
      .select();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
};