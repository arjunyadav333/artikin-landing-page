import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 font-inter">
            Ready to Elevate Your Creative Journey?
          </h2>
          <p className="text-lg md:text-xl mb-12 opacity-90 font-inter">
            Join thousands of artists who are building their careers with Artikin today.
          </p>
          <Button 
            onClick={() => navigate("/auth")} 
            className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-inter"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;