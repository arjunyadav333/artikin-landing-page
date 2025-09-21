import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-6">
          Welcome to Our Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Connect, discover opportunities, and grow your network
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button variant="outline" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;