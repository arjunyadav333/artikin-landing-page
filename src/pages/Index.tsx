import { ArrowRight, Play } from "lucide-react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

const HeroSection = () => {
  const { navigateWithScrollSave } = useScrollRestoration();

  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen xs:min-h-[100dvh] flex items-start md:items-center justify-center overflow-hidden pt-20 xs:pt-24 sm:pt-32 md:pt-0 bg-gradient-to-b from-white via-blue-50 to-blue-100"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              Connecting creativity
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
                with Opportunity
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              From emerging creators to established talent, <span className="font-semibold text-blue-500">Artikin</span> gives every artist a space to showcase their work and connect with people and opportunities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl flex items-center"
                onClick={() => navigateWithScrollSave("/auth")}
              >
                Join Artikin
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={() =>
                  window.open(
                    "https://youtu.be/lu58Um79-N4?si=g6JycaokuKJKDpcd",
                    "Ayejude"
                  )
                }
                className="group flex items-center px-8 py-4 text-gray-700 font-semibold text-lg hover:text-blue-500 transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg mr-3 group-hover:shadow-xl transition-shadow duration-300">
                  <Play className="w-6 h-6 text-blue-500 ml-1" />
                </div>
                Watch Trailer
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-3xl mx-auto">
              {[
                { number: "1K+", label: "Users" },
                { number: "99.9%", label: "Uptime" },
                { number: "24/7", label: "Support" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center animate-fade-in-up bg-white shadow-lg rounded-2xl py-6 px-4 hover:shadow-2xl transition-shadow duration-300"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 xs:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-14 border-2 border-white/70 rounded-full flex justify-center items-start cursor-pointer hover:scale-110 transition-transform duration-300">
            <div className="w-2 h-4 bg-white/80 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* What is Artikin Section */}
      <section className="py-20 sm:py-24 lg:py-28 bg-gradient-to-b from-blue-50 to-white relative">
        <div className="container mx-auto px-6 sm:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-8 sm:mb-10 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            What is Artikin?
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed px-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg py-8 hover:shadow-2xl transition-shadow duration-300">
              <span className="font-semibold text-blue-500">Artikin</span> is a
              creative networking platform designed for artists to showcase
              their work, build meaningful connections, and discover
              opportunities with organizations. It acts as a bridge between{" "}
              <span className="font-semibold text-purple-500">creativity</span>{" "}
              and <span className="font-semibold text-pink-500">industry</span>,
              helping artists gain visibility while enabling organizations to
              find the right talent.
            </p>
          </div>
        </div>

        {/* Decorative Background Shapes */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </section>
    </>
  );
};

export default HeroSection;
