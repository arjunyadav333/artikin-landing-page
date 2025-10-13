import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Image, X, Upload, Loader2, ArrowLeft } from "lucide-react";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { useCreatePost } from "@/hooks/usePosts";
import { supabase } from "@/integrations/supabase/client";

const Create = () => {
  const navigate = useNavigate();
  const { data: profile } = useCurrentProfile();
  const createPostMutation = useCreatePost();
  
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(() => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag("");
    }
  }, [currentTag, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 50MB per file`);
        return false;
      }
      return true;
    }).slice(0, 10); // Max 10 files

    setMediaFiles(validFiles);

    // Create previews
    const previews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews.push(event.target?.result as string);
        if (previews.length === validFiles.length) {
          setMediaPreview([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length === 0) {
      setMediaPreview([]);
    }
  }, []);

  const removeMedia = useCallback((index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;

    try {
      // Upload media files to Supabase Storage
      let uploadedUrls: string[] = [];
      let mediaTypes: string[] = [];
      
      if (mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(async (file, index) => {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${index}.${fileExt}`;
            const bucket = file.type.startsWith('video/') ? 'post-videos' : 'post-images';
            
            const { data, error } = await supabase.storage
              .from('posts')
              .upload(fileName, file);

            if (error) throw error;

            const { data: urlData } = supabase.storage
              .from('posts')
              .getPublicUrl(fileName);

            return {
              url: urlData.publicUrl,
              type: file.type.startsWith('video/') ? 'video' : 'image'
            };
          } catch (error) {
            console.error('Failed to upload file:', file.name, error);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(r => r !== null);
        
        uploadedUrls = successfulUploads.map(r => r!.url);
        mediaTypes = successfulUploads.map(r => r!.type);
      }

      const postData = {
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
        media_urls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        media_types: mediaTypes.length > 0 ? mediaTypes : undefined,
        media_type: uploadedUrls.length > 0 ? mediaTypes[0] : 'text'
      };

      createPostMutation.mutate(postData, {
        onSuccess: () => {
          // Reset form
          setContent("");
          setTags([]);
          setCurrentTag("");
          setMediaFiles([]);
          setMediaPreview([]);
          
          // Navigate back to home feed
          navigate("/home");
        }
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  }, [content, tags, mediaFiles, createPostMutation, navigate]);

  const getUserDisplayInfo = () => {
    if (!profile) return { name: "Loading...", username: "@loading", avatar: "" };
    
    const displayName = profile.display_name || profile.full_name || "User";
    const username = profile.username ? `@${profile.username}` : "@user";
    const avatar = profile.avatar_url || "";
    
    return { name: displayName, username, avatar };
  };

  const { name, username, avatar } = getUserDisplayInfo();
  const isLoading = createPostMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first responsive layout */}
      <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-32 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Create Post</h1>
          </div>
          <p className="text-sm text-muted-foreground">Share your thoughts with the community</p>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatar} alt="Your avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{name}</p>
                <p className="text-sm text-muted-foreground truncate">{username}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Post Content */}
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="What's happening? Share your thoughts, progress, or inspiration..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] text-base resize-none border-input focus:border-primary transition-colors"
                  maxLength={2000}
                />
                <div className="text-xs text-muted-foreground text-right mt-1">
                  {content.length}/2000
                </div>
              </div>

              {/* Media Upload */}
              <div className="space-y-3">
                <div 
                  className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload photos or videos (max 10)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF, MP4 up to 50MB each
                    </p>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Media Preview */}
                {mediaPreview.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {mediaPreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          {mediaFiles[index]?.type.startsWith('image/') ? (
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video 
                              src={preview}
                              className="w-full h-full object-cover"
                              controls={false}
                            />
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMedia(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add tags... (press Enter)"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={tags.length >= 10}
                  />
                  <Button 
                    onClick={addTag} 
                    size="sm" 
                    variant="outline"
                    disabled={!currentTag.trim() || tags.length >= 10}
                  >
                    Add
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-destructive transition-colors"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {tags.length}/10 tags
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => navigate("/home")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Create;