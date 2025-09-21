import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-foreground">Welcome</h1>
        <p className="text-lg text-muted-foreground">Get started with your account</p>
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