import React from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Users, CheckCircle, Briefcase, ChevronRight } from "lucide-react";

const CommunityGuidelines = () => {
  const cards = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Stay Respectful",
      description: "Create a respectful and supportive environment where artists and professionals can collaborate and grow together."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Be Authentic",
      description: "Use your real identity and share accurate information. Authentic profiles help build lasting trust in the community."
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Keep It Professional",
      description: "Artikin is a professional platform for creators. Conversations and content should remain constructive and purposeful."
    }
  ];

  const toc = [
    { id: "respect", title: "1. Respect the Community" },
    { id: "safety", title: "2. Safety and Harassment" },
    { id: "illegal", title: "3. Illegal or Harmful Content" },
    { id: "authentic", title: "4. Authentic Profiles" },
    { id: "professional", title: "5. Professional Conduct" },
    { id: "spam", title: "6. Spam and Misuse" },
    { id: "report", title: "7. Reporting Violations" },
    { id: "enforcement", title: "8. Policy Enforcement" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Community Guidelines
            </h1>
            <div className="text-lg text-slate-600 max-w-3xl mx-auto space-y-4">
              <p>
                Artikin is a professional platform where artists, creators, organizations, and hirers connect to
                share ideas, showcase work, and build meaningful collaborations.
              </p>
              <p>
                Our goal is to create a respectful environment where creativity and professional opportunities can
                thrive. These Community Guidelines help ensure that Artikin remains a safe, constructive, and
                professional space for everyone.
              </p>
              <p>
                By participating on Artikin, you agree to follow these guidelines and contribute positively to the
                community.
              </p>
            </div>
          </header>

          {/* Core Values Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {cards.map((card, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-md group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Table of Contents */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-blue-600 mb-16">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toc.map((item) => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`} 
                  className="flex items-center text-blue-600 font-medium hover:underline group"
                >
                  <ChevronRight className="w-4 h-4 mr-1 transition-transform group-hover:translate-x-1" />
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          {/* Guideline Sections */}
          <div className="space-y-12 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
            <section id="respect">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                1. Respect the Community
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>Artikin is built to help creative professionals connect and succeed. Members should treat each other with respect and professionalism. Conversations should remain constructive and supportive.</p>
                <p>Content that targets individuals with harassment, insults, intimidation, or abusive language is not allowed on the platform.</p>
              </div>
            </section>

            <section id="safety">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                2. Safety and Harassment
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>We do not allow bullying, harassment, or threats directed toward individuals or groups. This includes personal attacks, intimidation, or attempts to shame or humiliate others.</p>
                <p>Members should not share private or sensitive information about others without permission.</p>
              </div>
            </section>

            <section id="illegal">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                3. Illegal or Harmful Content
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>Artikin does not allow illegal or harmful content on the platform. This includes content that promotes criminal activity or violates applicable laws.</p>
                <p>The following types of content are strictly prohibited:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pornographic or sexually explicit material, nudity, and adult content.</li>
                  <li>Content that promotes violence or harm toward individuals or groups.</li>
                  <li>Content involving exploitation or abuse of children.</li>
                  <li>Promotion or sale of illegal goods or services.</li>
                  <li>Content encouraging self-harm or dangerous activities.</li>
                </ul>
              </div>
            </section>

            <section id="authentic">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                4. Authentic Profiles
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>Members should use their real identity and provide accurate information about themselves or their organization.</p>
                <p>Fake profiles, impersonation, or misleading information about qualifications, experience, or identity are not allowed.</p>
              </div>
            </section>

            <section id="professional">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                5. Professional Conduct
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>Artikin is designed for professional collaboration and creative opportunities. Content shared on the platform should reflect professional standards.</p>
                <p>Sexual harassment, inappropriate advances, or romantic solicitations are not allowed. Artikin is a professional network and should not be used as a dating platform.</p>
              </div>
            </section>

            <section id="spam">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                6. Spam and Misuse
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>Members should not send spam messages, promotional content, or repetitive unsolicited communications.</p>
                <p>Using the platform to distribute malware, scams, misleading promotions, or fraudulent schemes is strictly prohibited.</p>
              </div>
            </section>

            <section id="report">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                7. Reporting Violations
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>If you see content that violates these Community Guidelines, please report it using the reporting tools available within the platform.</p>
                <p>User reports help us maintain a safe and professional environment. Our moderation team and automated systems review reported content to determine whether it violates our policies.</p>
              </div>
            </section>

            <section id="enforcement">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                8. Policy Enforcement
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>Violations of these Community Guidelines may result in actions including removal of content, reduced visibility, account warnings, or suspension of accounts.</p>
                <p>Repeated or severe violations may lead to permanent removal from the platform.</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityGuidelines;
