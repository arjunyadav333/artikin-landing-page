import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/hooks/useProfiles';
import { AddButton } from '../ui/AddButton';

interface MediaSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function MediaSection({ profile, isOwnProfile }: MediaSectionProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Media Gallery</CardTitle>
        {isOwnProfile && <AddButton onClick={() => {}} />}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">No media added yet.</p>
      </CardContent>
    </Card>
  );
}