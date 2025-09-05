import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to the Home Feed</h3>
            <p className="text-muted-foreground text-sm">
              Your feed will appear here. Let's start by creating your first post!
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mt-2">
                Logged in as: {user.email}
              </p>
            )}
          </div>
          <Link to="/create">
            <Button className="rounded-full px-8">Create Post</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;