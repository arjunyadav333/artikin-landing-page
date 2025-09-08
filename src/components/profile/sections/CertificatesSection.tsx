import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Award, Calendar, ExternalLink, Edit, Trash2, FileText, Download } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CertificatesSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  verification_url?: string;
}

// Mock data for certificates
const mockCertificates: Certificate[] = [
  {
    id: '1',
    title: 'Advanced Acting Techniques',
    issuer: 'National School of Drama',
    year: '2023',
    description: 'Comprehensive course covering method acting, improvisation, and character development.',
    file_url: '/api/placeholder/certificate1.pdf',
    file_name: 'Acting_Certificate_2023.pdf',
    verification_url: 'https://nsd.gov.in/verify/12345'
  },
  {
    id: '2',
    title: 'Contemporary Dance Certification',
    issuer: 'Royal Academy of Dance',
    year: '2022',
    description: 'Professional certification in contemporary dance techniques and choreography.',
    file_url: '/api/placeholder/certificate2.pdf',
    file_name: 'Dance_Certificate_2022.pdf'
  }
];

export function CertificatesSection({ profile, isOwnProfile }: CertificatesSectionProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    title: '',
    issuer: '',
    year: '',
    description: '',
    verification_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addCertificate = () => {
    const certificate: Certificate = {
      id: Date.now().toString(),
      ...newCertificate,
      file_url: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      file_name: selectedFile?.name
    };
    setCertificates(prev => [certificate, ...prev]);
    setNewCertificate({
      title: '',
      issuer: '',
      year: '',
      description: '',
      verification_url: ''
    });
    setSelectedFile(null);
    setIsAddingCertificate(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Certificates</h2>
          <p className="text-sm text-gray-600 mt-1">Professional certifications and training credentials</p>
        </div>

        {isOwnProfile && (
          <Dialog open={isAddingCertificate} onOpenChange={setIsAddingCertificate}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl">
                <Plus className="h-4 w-4" />
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Certificate</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cert-title">Certificate Title</Label>
                    <Input
                      id="cert-title"
                      value={newCertificate.title}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter certificate name"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cert-year">Year</Label>
                    <Input
                      id="cert-year"
                      type="number"
                      min="1950"
                      max="2030"
                      value={newCertificate.year}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2024"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cert-issuer">Issuing Organization</Label>
                  <Input
                    id="cert-issuer"
                    value={newCertificate.issuer}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="Enter organization name"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cert-description">Description (Optional)</Label>
                  <Textarea
                    id="cert-description"
                    value={newCertificate.description}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the certification..."
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cert-verification">Verification URL (Optional)</Label>
                  <Input
                    id="cert-verification"
                    type="url"
                    value={newCertificate.verification_url}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, verification_url: e.target.value }))}
                    placeholder="https://..."
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cert-file">Certificate File (Optional)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="cert-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="rounded-2xl"
                    />
                    {selectedFile && (
                      <Badge variant="secondary" className="rounded-full">
                        {selectedFile.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, JPEG, PNG (Max 5MB)
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingCertificate(false)} 
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addCertificate} 
                    className="rounded-2xl" 
                    disabled={!newCertificate.title || !newCertificate.issuer || !newCertificate.year}
                  >
                    Add Certificate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Certificates List */}
      {certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="rounded-2xl shadow-sm p-6 bg-white border-gray-200">
              <div className="flex items-start gap-6">
                {/* Certificate Icon */}
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>

                {/* Certificate Details */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{certificate.title}</h3>
                      <p className="text-gray-700 font-medium">{certificate.issuer}</p>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {certificate.year}
                      </div>
                    </div>

                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {certificate.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {certificate.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {certificate.file_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 rounded-2xl"
                        onClick={() => window.open(certificate.file_url, '_blank')}
                      >
                        <FileText className="h-3 w-3" />
                        View Certificate
                      </Button>
                    )}

                    {certificate.verification_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 rounded-2xl"
                        onClick={() => window.open(certificate.verification_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-sm p-12 text-center bg-gray-50/50 border-gray-200">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificates added yet</h3>
          <p className="text-gray-600 mb-6">
            {isOwnProfile 
              ? 'Add your professional certifications and training credentials to showcase your expertise.'
              : `This ${profile.role} hasn't added any certificates yet.`
            }
          </p>
          {isOwnProfile && (
            <Button className="rounded-2xl" onClick={() => setIsAddingCertificate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Certificate
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}