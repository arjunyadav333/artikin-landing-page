import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Music, Palette, Type, Globe, X } from "lucide-react";

const Create = () => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const mediaTypes = [
    { id: "image", label: "Image", icon: Image, color: "text-primary" },
    { id: "video", label: "Video", icon: Video, color: "text-creative" },
    { id: "audio", label: "Audio", icon: Music, color: "text-opportunity" },
    { id: "artwork", label: "Artwork", icon: Palette, color: "text-accent" },
    { id: "text", label: "Text Post", icon: Type, color: "text-muted-foreground" },
    { id: "link", label: "Link", icon: Globe, color: "text-connection" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Create Post</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt="Your avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Your Name</p>
                <p className="text-sm text-muted-foreground">@username</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="post" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="post">Create Post</TabsTrigger>
                <TabsTrigger value="opportunity">Post Opportunity</TabsTrigger>
              </TabsList>

              <TabsContent value="post" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title (optional)</Label>
                    <Input
                      id="title"
                      placeholder="Give your post a title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">What's on your mind?</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts, progress, or inspiration..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[120px] mt-2 resize-none"
                    />
                  </div>

                  <div>
                    <Label>Media Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {mediaTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          className="h-16 flex-col space-y-2 hover:border-primary"
                        >
                          <type.icon className={`h-5 w-5 ${type.color}`} />
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center">
                    <div className="space-y-2">
                      <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your files here, or click to browse
                      </p>
                      <Button variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          id="tags"
                          placeholder="Add a tag..."
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button onClick={addTag} size="sm" variant="outline">
                          Add
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="opportunity" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="job-title">Opportunity Title</Label>
                    <Input
                      id="job-title"
                      placeholder="e.g., Freelance Graphic Designer"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., New York, NY or Remote"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary">Budget/Salary</Label>
                      <Input
                        id="salary"
                        placeholder="e.g., $5,000 - $10,000"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the opportunity, requirements, and what you're looking for..."
                      className="min-h-[120px] mt-2 resize-none"
                    />
                  </div>

                  <div>
                    <Label>Opportunity Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {["Full-time", "Contract", "Freelance", "Internship"].map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          className="h-10 hover:border-opportunity"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline">Save Draft</Button>
              <Button className="bg-primary hover:bg-primary/90">
                Publish Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Create;