import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, History, Trash2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

interface BodyFeaturesCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface BodyFeatures {
  id: string;
  eyeColor: string;
  hairColor: string;
  skinColor: string;
  height: number;
  heightUnit: 'cm' | 'ft';
  weight: number;
  weightUnit: 'kg' | 'lb';
  recordedAt: Date;
  isPrimary: boolean;
}

const eyeColors = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Other'];
const hairColors = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Other'];
const skinColors = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Dark', 'Deep'];

export function BodyFeaturesCard({ profile, isOwnProfile }: BodyFeaturesCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFeatures, setNewFeatures] = useState({
    eyeColor: '',
    hairColor: '',
    skinColor: '',
    height: 0,
    heightUnit: 'cm' as 'cm' | 'ft',
    weight: 0,
    weightUnit: 'kg' as 'kg' | 'lb'
  });

  // Mock body features data - current and historical
  const [bodyFeatures, setBodyFeatures] = useState<BodyFeatures[]>([
    {
      id: '1',
      eyeColor: 'Brown',
      hairColor: 'Black',
      skinColor: 'Medium',
      height: 175,
      heightUnit: 'cm',
      weight: 68,
      weightUnit: 'kg',
      recordedAt: new Date(),
      isPrimary: true
    },
    {
      id: '2',
      eyeColor: 'Brown',
      hairColor: 'Brown', // Changed hair color
      skinColor: 'Medium',
      height: 175,
      heightUnit: 'cm',
      weight: 70, // Previous weight
      weightUnit: 'kg',
      recordedAt: new Date('2023-06-01'),
      isPrimary: false
    }
  ]);

  const primaryFeatures = bodyFeatures.find(f => f.isPrimary);
  const historicalFeatures = bodyFeatures.filter(f => !f.isPrimary).sort(
    (a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()
  );

  const handleAddMeasurement = () => {
    if (newFeatures.height && newFeatures.weight) {
      // Set current primary to non-primary
      setBodyFeatures(prev => prev.map(f => ({ ...f, isPrimary: false })));
      
      const features: BodyFeatures = {
        id: Date.now().toString(),
        ...newFeatures,
        recordedAt: new Date(),
        isPrimary: true
      };
      
      setBodyFeatures(prev => [features, ...prev]);
      setNewFeatures({
        eyeColor: '',
        hairColor: '',
        skinColor: '',
        height: 0,
        heightUnit: 'cm',
        weight: 0,
        weightUnit: 'kg'
      });
      setIsAddModalOpen(false);
      // TODO: Save to backend
    }
  };

  const handleDelete = (id: string) => {
    setBodyFeatures(prev => prev.filter(f => f.id !== id));
    // TODO: Delete from backend
  };

  const formatHeight = (height: number, unit: 'cm' | 'ft') => {
    if (unit === 'cm') {
      return `${height} cm`;
    } else {
      const feet = Math.floor(height);
      const inches = Math.round((height - feet) * 12);
      return `${feet}'${inches}"`;
    }
  };

  const formatWeight = (weight: number, unit: 'kg' | 'lb') => {
    return `${weight} ${unit}`;
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">Body Features</CardTitle>
        {isOwnProfile && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-2xl px-4 py-2 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Add Body Measurements</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 px-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Eye Color</Label>
                    <Select value={newFeatures.eyeColor} onValueChange={(value) => 
                      setNewFeatures(prev => ({ ...prev, eyeColor: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select eye color" />
                      </SelectTrigger>
                      <SelectContent>
                        {eyeColors.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Hair Color</Label>
                    <Select value={newFeatures.hairColor} onValueChange={(value) => 
                      setNewFeatures(prev => ({ ...prev, hairColor: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hair color" />
                      </SelectTrigger>
                      <SelectContent>
                        {hairColors.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Skin Color</Label>
                    <Select value={newFeatures.skinColor} onValueChange={(value) => 
                      setNewFeatures(prev => ({ ...prev, skinColor: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skin color" />
                      </SelectTrigger>
                      <SelectContent>
                        {skinColors.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Height"
                        value={newFeatures.height || ''}
                        onChange={(e) => setNewFeatures(prev => ({ 
                          ...prev, 
                          height: parseFloat(e.target.value) || 0 
                        }))}
                      />
                      <Select value={newFeatures.heightUnit} onValueChange={(value: 'cm' | 'ft') => 
                        setNewFeatures(prev => ({ ...prev, heightUnit: value }))
                      }>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="ft">ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={newFeatures.weight || ''}
                        onChange={(e) => setNewFeatures(prev => ({ 
                          ...prev, 
                          weight: parseFloat(e.target.value) || 0 
                        }))}
                      />
                      <Select value={newFeatures.weightUnit} onValueChange={(value: 'kg' | 'lb') => 
                        setNewFeatures(prev => ({ ...prev, weightUnit: value }))
                      }>
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

              </div>
              <div className="flex gap-2 pt-4 border-t bg-white flex-shrink-0 mt-4">
                <Button onClick={handleAddMeasurement} className="rounded-2xl">
                  Add Measurement
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        {primaryFeatures ? (
          <div className="space-y-6">
            {/* Current Measurements */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Current Measurements
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Eyes</div>
                  <div className="font-medium text-gray-800">{primaryFeatures.eyeColor}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Hair</div>
                  <div className="font-medium text-gray-800">{primaryFeatures.hairColor}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Skin</div>
                  <div className="font-medium text-gray-800">{primaryFeatures.skinColor}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Height</div>
                  <div className="font-medium text-gray-800">
                    {formatHeight(primaryFeatures.height, primaryFeatures.heightUnit)}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Weight</div>
                  <div className="font-medium text-gray-800">
                    {formatWeight(primaryFeatures.weight, primaryFeatures.weightUnit)}
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Measurements */}
            {historicalFeatures.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-500" />
                  Historical Measurements
                </h4>
                <div className="space-y-3">
                  {historicalFeatures.map((features) => (
                    <div 
                      key={features.id}
                      className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-2">
                          {features.recordedAt.toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span><strong>Eyes:</strong> {features.eyeColor}</span>
                          <span><strong>Hair:</strong> {features.hairColor}</span>
                          <span><strong>Skin:</strong> {features.skinColor}</span>
                          <span><strong>Height:</strong> {formatHeight(features.height, features.heightUnit)}</span>
                          <span><strong>Weight:</strong> {formatWeight(features.weight, features.weightUnit)}</span>
                        </div>
                      </div>
                      
                      {isOwnProfile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(features.id)}
                          className="rounded-2xl text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <User className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p>No body measurements added yet</p>
            {isOwnProfile && (
              <p className="text-sm mt-1">Add your current measurements for casting directors</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}