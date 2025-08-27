-- Add saves_count column to posts table for save functionality
ALTER TABLE public.posts 
ADD COLUMN saves_count integer DEFAULT 0;