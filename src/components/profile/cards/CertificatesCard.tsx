import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CalendarIcon, Award, ExternalLink, Trash2, FileUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Profile } from '@/hooks/useProfiles';

interface CertificatesCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: Date;
  description: string;
  attachmentUrl?: string;
  externalLink?: string;
}

export function CertificatesCard({ profile, isOwnProfile }: CertificatesCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    title: '',
    issuer: '',
    date: new Date(),
    description: '',
    attachmentUrl: '',
    externalLink: ''
  });

  // Mock certificates data
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      title: 'Advanced Acting Techniques',
      issuer: 'National Theatre Academy',
      date: new Date('2023-08-15'),
      description: 'Completed intensive 6-month program in method acting and character development.',
      externalLink: 'https://certificate-verify.com/abc123'
    },
    {
      id: '2',
      title: 'Voice & Diction Certification',
      issuer: 'Speech & Drama Institute',
      date: new Date('2023-03-20'),
      description: 'Professional certification in voice modulation and clear speech for performers.'
    }
  ]);

  const handleAddCertificate = () => {
    if (newCertificate.title && newCertificate.issuer) {
      const certificate: Certificate = {
        id: Date.now().toString(),
        ...newCertificate
      };
      setCertificates(prev => [certificate, ...prev]);
      setNewCertificate({
        title: '',
        issuer: '',
        date: new Date(),
        description: '',
        attachmentUrl: '',
        externalLink: ''
      });
      setIsAddModalOpen(false);
      // TODO: Save to backend
    }
  };

  const handleDelete = (id: string) => {
    setCertificates(prev => prev.filter(cert => cert.id !== id));
    // TODO: Delete from backend
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">Certificates</CardTitle>
        {isOwnProfile && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-2xl px-4 py-2 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl p-6 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Certificate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Certificate name"
                      value={newCertificate.title}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Issuer</Label>
                    <Input
                      placeholder="Institution or organization"
                      value={newCertificate.issuer}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date Issued</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newCertificate.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newCertificate.date ? format(newCertificate.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newCertificate.date}
                        onSelect={(date) => date && setNewCertificate(prev => ({ ...prev, date }))}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the certificate..."
                    value={newCertificate.description}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                  <div className="space-y-2">
                    <Label>External Link (optional)</Label>
                    <Input
                      placeholder="https://verification-link.com"
                      value={newCertificate.externalLink}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, externalLink: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attachment (optional)</Label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {/* TODO: Open file picker */}}
                    >
                      <FileUp className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload attachment</p>
                      <p className="text-xs text-gray-400 mt-1">Images, documents up to 10MB</p>
                    </div>
                  </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddCertificate} className="rounded-2xl">
                    Add Certificate
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        {certificates.length > 0 ? (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <div 
                key={certificate.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {certificate.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        Issued by {certificate.issuer}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {format(certificate.date, 'MMMM yyyy')}
                      </p>
                      {certificate.description && (
                        <p className="text-sm text-gray-700 mb-3">
                          {certificate.description}
                        </p>
                      )}
                      {certificate.externalLink && (
                        <a
                          href={certificate.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Verify Certificate <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(certificate.id)}
                      className="rounded-2xl text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <Award className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p>No certificates added yet</p>
            {isOwnProfile && (
              <p className="text-sm mt-1">Add your professional certifications and achievements</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}