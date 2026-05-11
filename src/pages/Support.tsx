import React from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { MessageCircle, HelpCircle, FileText, Globe, ExternalLink, ChevronRight } from "lucide-react";

const Support = () => {
  const categories = [
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: "General FAQ",
      description: "Find answers to frequently asked questions about Artikin.",
      links: [
        { name: "Privacy & Security", path: "/legal/privacy-policy" },
        { name: "Account Deletion", path: "/legal/privacy-policy#account-deletion" },
        { name: "Community Guidelines", path: "/legal/community-guidelines" }
      ]
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Contact Us",
      description: "Can't find what you're looking for? Reach out directly.",
      links: [
        { name: "Submit a Request", path: "#" },
        { name: "Email Support", path: "mailto:support@artikin.com", isExternal: true }
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Guides & Tutorials",
      description: "Learn how to make the most of your Artikin profile.",
      links: [
        { name: "Portfolio Tips", path: "#" },
        { name: "Applying for Jobs", path: "#" },
        { name: "Creative Collaborations", path: "#" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      <Header isScrolled={true} />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Artikin <span className="text-blue-500">Support</span> Center
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              How can we help you today? Explore our resources or contact us for personalized assistance.
            </p>
          </header>

          {/* Search Placeholder */}
          {/* <div className="max-w-xl mx-auto mb-20">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-hidden hover:border-[#0073cf] focus:ring-4 focus:ring-[#0073cf]/10 transition-all text-lg"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#0073cf] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#005fa8] transition-colors">
                Search
              </button>
            </div>
          </div> */}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {categories.map((category, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all duration-500 group">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{category.title}</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">{category.description}</p>
                <div className="space-y-3">
                  {category.links.map((link: any, i) => (
                    link.isExternal ? (
                      <a
                        key={i}
                        href={link.path}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {link.name} <ExternalLink size={14} />
                      </a>
                    ) : (
                      <Link
                        key={i}
                        to={link.path}
                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group/link"
                      >
                        {link.name} <ChevronRight size={14} className="ml-auto opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Support Form CTA */}
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6">Need more help?</h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                If our help articles don't solve your problem, please submit a formal support ticket. Our team
                usually responds within 24 hours.
              </p>
              <a
                href="mailto:support@artikin.com"
                className="inline-block bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
              >
                Contact Our Team
              </a>
            </div>
            {/* Background decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2 rounded-full"></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
