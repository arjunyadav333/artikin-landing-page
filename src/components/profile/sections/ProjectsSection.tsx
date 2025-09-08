import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/hooks/useProfiles';
import { AddButton } from '../ui/AddButton';

interface ProjectsSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function ProjectsSection({ profile, isOwnProfile }: ProjectsSectionProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Past Projects</CardTitle>
        {isOwnProfile && <AddButton onClick={() => {}} />}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">No projects added yet.</p>
      </CardContent>
    </Card>
  );
}