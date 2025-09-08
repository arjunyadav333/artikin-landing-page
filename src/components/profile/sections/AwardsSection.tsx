import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/hooks/useProfiles';
import { AddButton } from '../ui/AddButton';

interface AwardsSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function AwardsSection({ profile, isOwnProfile }: AwardsSectionProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Awards</CardTitle>
        {isOwnProfile && <AddButton onClick={() => {}} />}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">No awards added yet.</p>
      </CardContent>
    </Card>
  );
}