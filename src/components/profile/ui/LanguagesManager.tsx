import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface LanguagesManagerProps {
  isOwnProfile: boolean;
  languages?: string[];
}

export function LanguagesManager({ isOwnProfile, languages: initialLanguages = [] }: LanguagesManagerProps) {
  const [languages, setLanguages] = useState<string[]>(
    initialLanguages.length > 0 ? initialLanguages : ['English', 'Telugu', 'Hindi']
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');

  const predefinedLanguages = [
    'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 
    'Malayalam', 'Marathi', 'Punjabi', 'Bengali', 'Gujarati'
  ];

  const availableLanguages = predefinedLanguages.filter(
    lang => !languages.includes(lang)
  );

  const handleAddPredefined = (language: string) => {
    if (!languages.includes(language)) {
      setLanguages([...languages, language]);
    }
  };

  const handleAddCustom = () => {
    if (customLanguage.trim() && !languages.includes(customLanguage.trim())) {
      setLanguages([...languages, customLanguage.trim()]);
      setCustomLanguage('');
      setShowAddForm(false);
    }
  };

  const handleRemove = (language: string) => {
    setLanguages(languages.filter(lang => lang !== language));
  };

  return (
    <div className="space-y-4">
      {/* Current Languages */}
      <div className="flex flex-wrap gap-2">
        {languages.map((language) => (
          <Badge 
            key={language} 
            variant="secondary" 
            className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20 px-3 py-1"
          >
            {language}
            {isOwnProfile && (
              <button
                onClick={() => handleRemove(language)}
                className="ml-1 hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        
        {languages.length === 0 && (
          <p className="text-sm text-gray-500">No languages specified</p>
        )}
      </div>

      {isOwnProfile && (
        <div className="space-y-3">
          {/* Quick Add Buttons for Predefined Languages */}
          {availableLanguages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.slice(0, 6).map((language) => (
                  <Button
                    key={language}
                    onClick={() => handleAddPredefined(language)}
                    variant="outline"
                    size="sm"
                    className="rounded-2xl text-xs h-7"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {language}
                  </Button>
                ))}
                {availableLanguages.length > 6 && (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-2xl text-xs h-7"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    More...
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Add Custom Language Form */}
          {showAddForm && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-2xl">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Add Custom Language</p>
                
                {/* Remaining predefined languages */}
                {availableLanguages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Available languages:</p>
                    <div className="flex flex-wrap gap-1">
                      {availableLanguages.map((language) => (
                        <Button
                          key={language}
                          onClick={() => {
                            handleAddPredefined(language);
                            if (availableLanguages.length === 1) {
                              setShowAddForm(false);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-xs h-6 px-2 hover:bg-primary/10"
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Enter language name"
                    className="rounded-2xl text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustom();
                      } else if (e.key === 'Escape') {
                        setShowAddForm(false);
                        setCustomLanguage('');
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddCustom}
                    size="sm"
                    className="rounded-2xl"
                    disabled={!customLanguage.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setCustomLanguage('');
                }}
                size="sm"
                className="rounded-2xl w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Main Add Button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          )}
        </div>
      )}
    </div>
  );
}