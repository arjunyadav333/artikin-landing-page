import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

const FinalCTA = () => {
  const { navigateWithScrollSave } = useScrollRestoration();

  return (
    <section className="py-20 bg-gradient-to-r from-[#4F8FF0] to-[#4F8FF5] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">
          Ready to elevate your creative journey?
        </h2>
        
        <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
          Join thousands of artists who are already building their careers on Artikin.
        </p>

<Button
  className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold rounded-xl touch-manipulation font-bold bg-blue-500 text-white hover:bg-blue-600 mb-2"
  onClick={() => navigateWithScrollSave("/auth")}
>
  Get Started
</Button>
      </div>
    </section>
  );
};

export default FinalCTA;