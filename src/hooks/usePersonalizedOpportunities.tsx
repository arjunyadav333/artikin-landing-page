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

export const usePersonalizedOpportunities = (limit: number = 3) => { // Phase 6: Reduced from 4 to 3
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-opportunities', user?.id, limit],
    queryFn: async (): Promise<PersonalizedOpportunity[]> => {
      if (!user) return [];

      // Phase 6: Parallelize profile fetch with initial opportunity search
      const profilePromise = supabase
        .from('profiles')
        .select('artform, role')
        .eq('user_id', user.id)
        .single();

      const { data: currentProfile } = await profilePromise;
      if (!currentProfile) return [];

      const userArtform = currentProfile.artform;
      const relevantKeywords = userArtform ? ARTFORM_OPPORTUNITY_MAPPING[userArtform] || [] : [];

      // Phase 6: Run all queries in parallel instead of sequential waterfall
      const [directMatches, ...keywordResults] = await Promise.all([
        // Direct artform match
        userArtform
          ? supabase
              .from('opportunities')
              .select(`
                id, title, company, organization_name, type, location,
                salary_min, salary_max, art_forms, experience_level, created_at, user_id,
                profiles (display_name, avatar_url, organization_type)
              `)
              .contains('art_forms', [userArtform])
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(limit)
          : Promise.resolve({ data: null }),
        
        // Keyword matches (run all in parallel)
        ...relevantKeywords.slice(0, 3).map(keyword =>
          supabase
            .from('opportunities')
            .select(`
              id, title, company, organization_name, type, location,
              salary_min, salary_max, art_forms, experience_level, created_at, user_id,
              profiles (display_name, avatar_url, organization_type)
            `)
            .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(limit)
        )
      ]);

      // Combine results and deduplicate
      const allOpportunities = [
        ...(directMatches.data || []),
        ...keywordResults.flatMap(result => result.data || [])
      ];

      const uniqueOpportunities = Array.from(
        new Map(allOpportunities.map(opp => [opp.id, opp])).values()
      );

      // If still not enough, fetch featured (most viewed)
      if (uniqueOpportunities.length < limit) {
        const remainingSlots = limit - uniqueOpportunities.length;
        const existingIds = uniqueOpportunities.map(o => o.id);
        const idsFilter = existingIds.length > 0 
          ? `(${existingIds.map(id => `"${id}"`).join(',')})`
          : '()';

        const { data: featuredOpportunities } = await supabase
          .from('opportunities')
          .select(`
            id, title, company, organization_name, type, location,
            salary_min, salary_max, art_forms, experience_level, created_at, user_id,
            profiles (display_name, avatar_url, organization_type)
          `)
          .not('id', 'in', idsFilter)
          .eq('status', 'active')
          .order('views_count', { ascending: false })
          .limit(remainingSlots);

        if (featuredOpportunities) {
          uniqueOpportunities.push(...featuredOpportunities);
        }
      }

      return uniqueOpportunities.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};