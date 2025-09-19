import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HomeFeedPost } from '@/hooks/useHomeFeed';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: HomeFeedPost;
}

export const EditPostModal = ({ isOpen, onClose, post }: EditPostModalProps) => {
  const [content, setContent] = useState(post.content || '');
  const [tagsString, setTagsString] = useState(post.tags?.join(', ') || '');
  const queryClient = useQueryClient();

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const { error } = await supabase
        .from('posts')
        .update({
          content: content.trim(),
          tags: tags.length > 0 ? tags : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onClose();
    },
    onError: (error: any) => {
      // Error handling without toast
    }
  });

  const handleSave = () => {
    if (!content.trim()) {
      return;
    }
    updatePostMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">          
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className="resize-none"
            />
          </div>
          
          <div>
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="art, music, dance (separate with commas)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updatePostMutation.isPending}
          >
            {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};