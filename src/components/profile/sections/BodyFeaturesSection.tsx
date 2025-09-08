import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Palette, 
  Ruler, 
  Scale, 
  Edit, 
  Plus, 
  Calendar,
  X
} from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { AddButton } from '../ui/AddButton';

interface BodyFeaturesSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface BodyMeasurement {
  id: string;
  eye_color: string;
  hair_color: string;
  skin_color: string;
  height_value: number;
  height_unit: 'cm' | 'ft';
  weight_value: number;
  weight_unit: 'kg' | 'lb';
  recorded_at: string;
  is_current: boolean;
}

export function BodyFeaturesSection({ profile, isOwnProfile }: BodyFeaturesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock body measurements data
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([
    {
      id: '1',
      eye_color: 'Brown',
      hair_color: 'Black',
      skin_color: 'Medium',
      height_value: 175,
      height_unit: 'cm',
      weight_value: 65,
      weight_unit: 'kg',
      recorded_at: '2024-01-15',
      is_current: true
    },
    {
      id: '2',
      eye_color: 'Brown',
      hair_color: 'Black',
      skin_color: 'Medium',
      height_value: 173,
      height_unit: 'cm',
      weight_value: 63,
      weight_unit: 'kg',
      recorded_at: '2023-06-15',
      is_current: false
    }
  ]);

  const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({
    eye_color: '',
    hair_color: '',
    skin_color: '',
    height_value: 0,
    height_unit: 'cm',
    weight_value: 0,
    weight_unit: 'kg'
  });

  const currentMeasurement = measurements.find(m => m.is_current) || measurements[0];

  const eyeColors = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Other'];
  const hairColors = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Other'];
  const skinColors = ['Fair', 'Light', 'Medium', 'Olive', 'Dark', 'Deep'];

  const handleAddMeasurement = () => {
    const id = Date.now().toString();
    const measurement: BodyMeasurement = {
      ...newMeasurement as BodyMeasurement,
      id,
      recorded_at: new Date().toISOString().split('T')[0],
      is_current: true
    };

    // Mark all others as not current
    const updatedMeasurements = measurements.map(m => ({ ...m, is_current: false }));
    setMeasurements([measurement, ...updatedMeasurements]);

    // Reset form
    setNewMeasurement({
      eye_color: '',
      hair_color: '',
      skin_color: '',
      height_value: 0,
      height_unit: 'cm',
      weight_value: 0,
      weight_unit: 'kg'
    });
    setShowAddForm(false);
  };

  const formatHeight = (value: number, unit: string) => {
    if (unit === 'ft') {
      const feet = Math.floor(value);
      const inches = Math.round((value - feet) * 12);
      return `${feet}'${inches}"`;
    }
    return `${value} cm`;
  };

  const formatWeight = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Body Features</CardTitle>
        {isOwnProfile && (
          <div className="flex gap-2">
            <AddButton 
              onClick={() => setShowAddForm(true)}
              label="Add Measurement"
              size="sm"
            />
            <AddButton 
              onClick={() => setIsEditing(!isEditing)}
              icon={isEditing ? X : Edit}
              size="sm"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {currentMeasurement && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eye Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Eye Color
              </Label>
              {isEditing ? (
                <select className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
                  {eyeColors.map((color) => (
                    <option key={color} value={color} selected={color === currentMeasurement.eye_color}>
                      {color}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {currentMeasurement.eye_color}
                </Badge>
              )}
            </div>

            {/* Hair Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Hair Color
              </Label>
              {isEditing ? (
                <select className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
                  {hairColors.map((color) => (
                    <option key={color} value={color} selected={color === currentMeasurement.hair_color}>
                      {color}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {currentMeasurement.hair_color}
                </Badge>
              )}
            </div>

            {/* Skin Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Skin Color</Label>
              {isEditing ? (
                <select className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
                  {skinColors.map((color) => (
                    <option key={color} value={color} selected={color === currentMeasurement.skin_color}>
                      {color}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {currentMeasurement.skin_color}
                </Badge>
              )}
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Height
              </Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    defaultValue={currentMeasurement.height_value}
                    className="rounded-2xl flex-1"
                  />
                  <select className="rounded-2xl border border-input bg-background px-3 py-2 text-sm w-20">
                    <option value="cm" selected={currentMeasurement.height_unit === 'cm'}>cm</option>
                    <option value="ft" selected={currentMeasurement.height_unit === 'ft'}>ft</option>
                  </select>
                </div>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {formatHeight(currentMeasurement.height_value, currentMeasurement.height_unit)}
                </Badge>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Weight
              </Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    defaultValue={currentMeasurement.weight_value}
                    className="rounded-2xl flex-1"
                  />
                  <select className="rounded-2xl border border-input bg-background px-3 py-2 text-sm w-20">
                    <option value="kg" selected={currentMeasurement.weight_unit === 'kg'}>kg</option>
                    <option value="lb" selected={currentMeasurement.weight_unit === 'lb'}>lb</option>
                  </select>
                </div>
              ) : (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {formatWeight(currentMeasurement.weight_value, currentMeasurement.weight_unit)}
                </Badge>
              )}
            </div>

            {/* Recorded Date */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Updated
              </Label>
              <p className="text-sm text-gray-500">
                {new Date(currentMeasurement.recorded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Historical Measurements */}
        {measurements.length > 1 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Measurement History</h4>
            <div className="space-y-2">
              {measurements.filter(m => !m.is_current).slice(0, 3).map((measurement) => (
                <div key={measurement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">{new Date(measurement.recorded_at).toLocaleDateString()}</span>
                    <span>{formatHeight(measurement.height_value, measurement.height_unit)}</span>
                    <span>{formatWeight(measurement.weight_value, measurement.weight_unit)}</span>
                  </div>
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-primary hover:text-primary/80"
                      onClick={() => {
                        // Make this measurement current
                        const updatedMeasurements = measurements.map(m => ({
                          ...m,
                          is_current: m.id === measurement.id
                        }));
                        setMeasurements(updatedMeasurements);
                      }}
                    >
                      Use Current
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Measurement Form */}
        {showAddForm && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
            <h4 className="font-medium text-gray-900">Add New Measurement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Eye Color</Label>
                <select 
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={newMeasurement.eye_color}
                  onChange={(e) => setNewMeasurement({...newMeasurement, eye_color: e.target.value})}
                >
                  <option value="">Select eye color</option>
                  {eyeColors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Hair Color</Label>
                <select 
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={newMeasurement.hair_color}
                  onChange={(e) => setNewMeasurement({...newMeasurement, hair_color: e.target.value})}
                >
                  <option value="">Select hair color</option>
                  {hairColors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Skin Color</Label>
                <select 
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={newMeasurement.skin_color}
                  onChange={(e) => setNewMeasurement({...newMeasurement, skin_color: e.target.value})}
                >
                  <option value="">Select skin color</option>
                  {skinColors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Height</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Height"
                    className="rounded-2xl flex-1"
                    value={newMeasurement.height_value || ''}
                    onChange={(e) => setNewMeasurement({...newMeasurement, height_value: parseFloat(e.target.value) || 0})}
                  />
                  <select 
                    className="rounded-2xl border border-input bg-background px-3 py-2 text-sm w-20"
                    value={newMeasurement.height_unit}
                    onChange={(e) => setNewMeasurement({...newMeasurement, height_unit: e.target.value as 'cm' | 'ft'})}
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-600">Weight</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Weight"
                    className="rounded-2xl flex-1"
                    value={newMeasurement.weight_value || ''}
                    onChange={(e) => setNewMeasurement({...newMeasurement, weight_value: parseFloat(e.target.value) || 0})}
                  />
                  <select 
                    className="rounded-2xl border border-input bg-background px-3 py-2 text-sm w-20"
                    value={newMeasurement.weight_unit}
                    onChange={(e) => setNewMeasurement({...newMeasurement, weight_unit: e.target.value as 'kg' | 'lb'})}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddMeasurement} size="sm" className="rounded-2xl">
                Add Measurement
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                size="sm"
                className="rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setIsEditing(false)} className="rounded-2xl">
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}