import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PersonalizedOpportunity {
  id: string;
  title: string;
  company: string | null;
  organization_name: string | null;
  type: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  art_forms: string[] | null;
  experience_level: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
    organization_type: string | null;
  };
}

const ARTFORM_OPPORTUNITY_MAPPING: Record<string, string[]> = {
  actor: ['actor', 'performer', 'talent', 'casting'],
  photographer: ['photographer', 'photography', 'visual', 'media', 'photo'],
  videographer: ['videographer', 'video', 'filmmaker', 'media', 'filming'],
  dancer: ['dancer', 'choreographer', 'performance', 'dance', 'ballet'],
  singer: ['singer', 'vocalist', 'music', 'performer', 'vocal', 'singing'],
  instrumentalist: ['musician', 'music', 'instrumental', 'band', 'orchestra'],
  model: ['model', 'modeling', 'fashion', 'commercial', 'runway'],
  drawing: ['artist', 'illustrator', 'visual', 'graphic', 'drawing'],
  painting: ['painter', 'artist', 'visual', 'fine art', 'painting']
};

export const usePersonalizedOpportunities = (limit: number = 4) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-opportunities', user?.id, limit],
    queryFn: async (): Promise<PersonalizedOpportunity[]> => {
      if (!user) return [];

      // Get current user's profile to know their artform
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('artform, role')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) return [];

      const userArtform = currentProfile.artform;
      const relevantKeywords = userArtform ? ARTFORM_OPPORTUNITY_MAPPING[userArtform] || [] : [];

      let opportunities: PersonalizedOpportunity[] = [];

      // Step 1: Find opportunities that match user's artform in art_forms array
      if (userArtform) {
        const { data: directMatches, error: directError } = await supabase
          .from('opportunities')
          .select(`
            id, title, company, organization_name, type, location,
            salary_min, salary_max, art_forms, experience_level, created_at, user_id,
            profiles (display_name, avatar_url, organization_type)
          `)
          .contains('art_forms', [userArtform])
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (directMatches && !directError) {
          opportunities = directMatches;
        }
      }

      // Step 2: If not enough opportunities, search by keywords in title/description
      if (opportunities.length < limit && relevantKeywords.length > 0) {
        const remainingSlots = limit - opportunities.length;
        const existingOpportunityIds = opportunities.map(o => o.id);

        for (const keyword of relevantKeywords) {
          if (opportunities.length >= limit) break;

          const { data: keywordMatches } = await supabase
            .from('opportunities')
            .select(`
              id, title, company, organization_name, type, location,
              salary_min, salary_max, art_forms, experience_level, created_at, user_id,
              profiles (display_name, avatar_url, organization_type)
            `)
            .not('id', 'in', `(${existingOpportunityIds.map(id => `"${id}"`).join(',')})`)
            .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(remainingSlots);

          if (keywordMatches) {
            opportunities = [...opportunities, ...keywordMatches];
            existingOpportunityIds.push(...keywordMatches.map(o => o.id));
          }
        }
      }

      // Step 3: If still not enough, add cross-artform opportunities that might be relevant
      if (opportunities.length < limit) {
        const remainingSlots = limit - opportunities.length;
        const existingOpportunityIds = opportunities.map(o => o.id);
        
        const crossArtformKeywords = [
          'creative', 'content', 'media', 'production', 'event', 
          'performance', 'artistic', 'cultural'
        ];

        for (const keyword of crossArtformKeywords) {
          if (opportunities.length >= limit) break;

          const { data: crossMatches } = await supabase
            .from('opportunities')
            .select(`
              id, title, company, organization_name, type, location,
              salary_min, salary_max, art_forms, experience_level, created_at, user_id,
              profiles (display_name, avatar_url, organization_type)
            `)
            .not('id', 'in', `(${existingOpportunityIds.map(id => `"${id}"`).join(',')})`)
            .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
            .eq('status', 'active')
            .order('views_count', { ascending: false })
            .limit(Math.ceil(remainingSlots / crossArtformKeywords.length));

          if (crossMatches) {
            opportunities = [...opportunities, ...crossMatches];
            existingOpportunityIds.push(...crossMatches.map(o => o.id));
          }
        }
      }

      // Step 4: If still not enough, add featured/general opportunities (most viewed)
      if (opportunities.length < limit) {
        const remainingSlots = limit - opportunities.length;
        const existingOpportunityIds = opportunities.map(o => o.id);
        const opportunityIdsFilter = existingOpportunityIds.length > 0 
          ? `(${existingOpportunityIds.map(id => `"${id}"`).join(',')})`
          : '()';

        const { data: featuredOpportunities } = await supabase
          .from('opportunities')
          .select(`
            id, title, company, organization_name, type, location,
            salary_min, salary_max, art_forms, experience_level, created_at, user_id,
            profiles (display_name, avatar_url, organization_type)
          `)
          .not('id', 'in', opportunityIdsFilter)
          .eq('status', 'active')
          .order('views_count', { ascending: false })
          .limit(remainingSlots);

        if (featuredOpportunities) {
          opportunities = [...opportunities, ...featuredOpportunities];
        }
      }

      return opportunities.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};